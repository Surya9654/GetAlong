import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { generateMockMapSvg } from '../utils/mockMap.js';

const router = Router();

// Helper to format ride object with points, riders, chat, reviews
async function getFullRide(rideId) {
  const rideRes = await pool.query(`SELECT * FROM rides WHERE id = $1`, [rideId]);
  if (rideRes.rowCount === 0) return null;
  const ride = rideRes.rows[0];

  const pointsRes = await pool.query(`SELECT point_name, distance_from_start_km FROM ride_points WHERE ride_id = $1 ORDER BY stop_order ASC`, [rideId]);
  const ridersRes = await pool.query(`SELECT rider_id, status FROM ride_participants WHERE ride_id = $1 ORDER BY joined_at ASC`, [rideId]);
  const chatRes = await pool.query(
    `SELECT m.rider_id as "riderId", m.message_text as text, TO_CHAR(m.created_at, 'HH12:MI AM') as time 
     FROM ride_chat_messages m WHERE m.ride_id = $1 ORDER BY m.created_at ASC`, [rideId]
  );
  const reviewsRes = await pool.query(
    `SELECT r.rider_id as "riderId", r.rating, r.comment 
     FROM ride_reviews r WHERE r.ride_id = $1 ORDER BY r.created_at DESC`, [rideId]
  );
  const photosRes = await pool.query(
    `SELECT p.id, p.uploader_id as "uploaderId", p.photo_url as "photoUrl", p.caption, TO_CHAR(p.created_at, 'Mon DD, YYYY') as time
     FROM ride_photos p WHERE p.ride_id = $1 ORDER BY p.created_at DESC`, [rideId]
  );

  return {
    id: ride.id,
    title: ride.title,
    hostId: ride.host_id,
    date: ride.date ? ride.date.toISOString().split('T')[0] : '',
    time: ride.time,
    distanceKm: ride.distance_km,
    difficulty: ride.difficulty,
    maxRiders: ride.max_riders,
    description: ride.description,
    status: ride.status,
    points: pointsRes.rows.map(p => p.point_name),
    currentRiders: ridersRes.rows.map(r => r.rider_id),
    chat: chatRes.rows,
    reviews: reviewsRes.rows,
    photos: photosRes.rows,
    routeSvg: ride.route_svg || null,
  };
}

// GET /api/rides - List all rides
router.get('/', async (req, res) => {
  try {
    const ridesRes = await pool.query(`SELECT id FROM rides ORDER BY created_at DESC`);
    const fullRides = await Promise.all(ridesRes.rows.map(r => getFullRide(r.id)));
    res.json(fullRides.filter(Boolean));
  } catch (err) {
    console.error('Error fetching rides:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rides/compute-route - Real road routing with Google Routes API & OSRM fallback
router.post('/compute-route', async (req, res) => {
  const { origin, destination, intermediates = [] } = req.body;
  if (!origin?.lat || !destination?.lat) {
    return res.status(400).json({ error: 'Origin and destination with lat/lng are required' });
  }

  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCw34wRhYoLDd03xoNv33qdN17lYe-GWGc';

  // 1. Try Google Routes API v2 (official driving route)
  try {
    const payload = {
      origin: { location: { latLng: { latitude: Number(origin.lat), longitude: Number(origin.lng) } } },
      destination: { location: { latLng: { latitude: Number(destination.lat), longitude: Number(destination.lng) } } },
      travelMode: 'DRIVE',
    };

    if (Array.isArray(intermediates) && intermediates.length > 0) {
      payload.intermediates = intermediates.map(item => ({
        location: { latLng: { latitude: Number(item.lat), longitude: Number(item.lng) } }
      }));
    }

    const gResponse = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
      },
      body: JSON.stringify(payload),
    });

    if (gResponse.ok) {
      const gData = await gResponse.json();
      if (gData.routes && gData.routes[0]) {
        const route = gData.routes[0];
        const distKm = Math.round(route.distanceMeters / 1000);
        return res.json({
          success: true,
          provider: 'google_routes',
          distanceKm: distKm,
          polyline: route.polyline?.encodedPolyline || '',
        });
      }
    }
  } catch (gErr) {
    console.warn('Google Routes API request error, falling back to OSRM:', gErr.message);
  }

  // 2. High-performance fallback: OpenStreetMap OSRM driving engine
  try {
    const allPoints = [origin, ...(intermediates || []), destination];
    const coordsStr = allPoints.map(p => `${p.lng},${p.lat}`).join(';');
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=polyline`;

    const osrmRes = await fetch(osrmUrl);
    if (osrmRes.ok) {
      const osrmData = await osrmRes.json();
      if (osrmData.routes && osrmData.routes[0]) {
        const route = osrmData.routes[0];
        const distKm = Math.round(route.distance / 1000);
        return res.json({
          success: true,
          provider: 'osrm',
          distanceKm: distKm,
          polyline: route.geometry || '',
        });
      }
    }
  } catch (osrmErr) {
    console.warn('OSRM route error:', osrmErr.message);
  }

  res.status(500).json({ error: 'Could not compute road driving route' });
});

// GET /api/rides/:id/mock-map - Serve the stored SVG route diagram for a ride
router.get('/:id/mock-map', async (req, res) => {
  try {
    const result = await pool.query(`SELECT route_svg FROM rides WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Ride not found' });
    const svg = result.rows[0].route_svg;
    if (!svg) return res.status(404).json({ error: 'No route map available for this ride' });
    res.json({ svg });
  } catch (err) {
    console.error('Error fetching mock map:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rides/:id - Fetch single ride details
router.get('/:id', async (req, res) => {
  try {
    const ride = await getFullRide(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json(ride);
  } catch (err) {
    console.error('Error fetching ride:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rides - Create new group ride
router.post('/', optionalAuth, async (req, res) => {
  const hostId = req.user ? req.user.id : (req.body.hostId || 'me');
  const { title, date, time, points, distanceKm, difficulty, maxRiders, description } = req.body;
  if (!title || !hostId || !date || !time) {
    return res.status(400).json({ error: 'Title, host, date, and time are required' });
  }

  const rideId = `ride-${Date.now()}`;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert ride
    await client.query(
      `INSERT INTO rides (id, title, host_id, date, time, distance_km, difficulty, max_riders, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'upcoming')`,
      [rideId, title, hostId, date, time, distanceKm || null, difficulty || 'cruiser', maxRiders || 8, description || '']
    );

    // Insert route points
    if (Array.isArray(points)) {
      for (let i = 0; i < points.length; i++) {
        await client.query(
          `INSERT INTO ride_points (ride_id, stop_order, point_name) VALUES ($1, $2, $3)`,
          [rideId, i, points[i]]
        );
      }
    }

    // Auto-join host as first participant
    await client.query(
      `INSERT INTO ride_participants (ride_id, rider_id, status) VALUES ($1, $2, 'approved') ON CONFLICT DO NOTHING`,
      [rideId, hostId]
    );

    // Generate mock route map SVG from waypoints
    if (Array.isArray(points) && points.length >= 2) {
      const svg = generateMockMapSvg(points, distanceKm ? Number(distanceKm) : null);
      await client.query(`UPDATE rides SET route_svg = $1 WHERE id = $2`, [svg, rideId]);
    }

    await client.query('COMMIT');

    const createdRide = await getFullRide(rideId);
    res.status(201).json(createdRide);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating ride:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/rides/:id/join - Join or Leave ride
router.post('/:id/join', optionalAuth, async (req, res) => {
  const rideId = req.params.id;
  const riderId = req.user ? req.user.id : req.body.riderId;
  if (!riderId) return res.status(400).json({ error: 'Rider ID required' });

  // Verify rider exists in users table
  const userCheck = await pool.query(`SELECT id FROM users WHERE id = $1`, [riderId]);
  if (userCheck.rowCount === 0) {
    return res.status(400).json({ error: 'Participant must be a registered user' });
  }

  try {
    const existing = await pool.query(
      `SELECT * FROM ride_participants WHERE ride_id = $1 AND rider_id = $2`,
      [rideId, riderId]
    );

    if (existing.rowCount > 0) {
      // Leave ride
      await pool.query(`DELETE FROM ride_participants WHERE ride_id = $1 AND rider_id = $2`, [rideId, riderId]);
    } else {
      // Join ride
      await pool.query(`INSERT INTO ride_participants (ride_id, rider_id, status) VALUES ($1, $2, 'approved')`, [rideId, riderId]);
    }

    const updatedRide = await getFullRide(rideId);
    res.json(updatedRide);
  } catch (err) {
    console.error('Error toggling join status:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rides/:id/chat - Send group chat message
router.post('/:id/chat', optionalAuth, async (req, res) => {
  const rideId = req.params.id;
  const riderId = req.user ? req.user.id : req.body.riderId;
  const { text } = req.body;
  if (!text || !riderId) return res.status(400).json({ error: 'Rider ID and text required' });

  try {
    await pool.query(
      `INSERT INTO ride_chat_messages (ride_id, rider_id, message_text) VALUES ($1, $2, $3)`,
      [rideId, riderId, text]
    );
    const updatedRide = await getFullRide(rideId);
    res.json(updatedRide);
  } catch (err) {
    console.error('Error sending chat message:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rides/:id/reviews - Post ride review
router.post('/:id/reviews', optionalAuth, async (req, res) => {
  const rideId = req.params.id;
  const riderId = req.user ? req.user.id : req.body.riderId;
  const { rating, comment } = req.body;
  if (!riderId || !comment) return res.status(400).json({ error: 'Rider ID and comment required' });

  try {
    await pool.query(
      `INSERT INTO ride_reviews (ride_id, rider_id, rating, comment) VALUES ($1, $2, $3, $4)
       ON CONFLICT (ride_id, rider_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment`,
      [rideId, riderId, rating || 5, comment]
    );
    const updatedRide = await getFullRide(rideId);
    res.json(updatedRide);
  } catch (err) {
    console.error('Error posting review:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rides/:id/photos - Upload ride photo (Participants or Host only)
router.post('/:id/photos', optionalAuth, async (req, res) => {
  const rideId = req.params.id;
  const uploaderId = req.user ? req.user.id : (req.body.uploaderId || 'me');
  const { photoUrl, caption } = req.body;
  if (!photoUrl || !uploaderId) return res.status(400).json({ error: 'Photo URL and uploader ID are required' });

  try {
    const rideCheck = await pool.query(`SELECT host_id FROM rides WHERE id = $1`, [rideId]);
    if (rideCheck.rowCount === 0) return res.status(404).json({ error: 'Ride not found' });

    const isHost = rideCheck.rows[0].host_id === uploaderId;
    const partCheck = await pool.query(`SELECT 1 FROM ride_participants WHERE ride_id = $1 AND rider_id = $2`, [rideId, uploaderId]);
    const isParticipant = partCheck.rowCount > 0;

    if (!isHost && !isParticipant) {
      return res.status(403).json({ error: 'Only ride participants or the host can upload photos to this ride' });
    }

    await pool.query(
      `INSERT INTO ride_photos (ride_id, uploader_id, photo_url, caption) VALUES ($1, $2, $3, $4)`,
      [rideId, uploaderId, photoUrl, caption || '']
    );
    const updatedRide = await getFullRide(rideId);
    res.status(201).json(updatedRide);
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rides/:id/photos/:photoId - Delete ride photo
router.delete('/:id/photos/:photoId', optionalAuth, async (req, res) => {
  const { id: rideId, photoId } = req.params;
  const callerId = req.user ? req.user.id : (req.body.callerId || 'me');

  try {
    const photoCheck = await pool.query(`SELECT uploader_id FROM ride_photos WHERE id = $1 AND ride_id = $2`, [photoId, rideId]);
    if (photoCheck.rowCount === 0) return res.status(404).json({ error: 'Photo not found' });
    
    const rideCheck = await pool.query(`SELECT host_id FROM rides WHERE id = $1`, [rideId]);
    const isHost = rideCheck.rowCount > 0 && rideCheck.rows[0].host_id === callerId;
    const isUploader = photoCheck.rows[0].uploader_id === callerId;

    if (!isHost && !isUploader) {
      return res.status(403).json({ error: 'Only photo uploader or ride host can delete this photo' });
    }

    await pool.query(`DELETE FROM ride_photos WHERE id = $1 AND ride_id = $2`, [photoId, rideId]);
    const updatedRide = await getFullRide(rideId);
    res.json(updatedRide);
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rides/:id - Cancel / Delete ride (Host only)
router.delete('/:id', optionalAuth, async (req, res) => {
  const rideId = req.params.id;
  const callerId = req.user ? req.user.id : (req.body.callerId || 'me');

  try {
    const rideCheck = await pool.query(`SELECT host_id FROM rides WHERE id = $1`, [rideId]);
    if (rideCheck.rowCount === 0) return res.status(404).json({ error: 'Ride not found' });
    
    if (rideCheck.rows[0].host_id !== callerId) {
      return res.status(403).json({ error: 'Only the ride host can cancel this ride' });
    }

    await pool.query(`DELETE FROM rides WHERE id = $1`, [rideId]);
    res.json({ success: true, cancelledRideId: rideId });
  } catch (err) {
    console.error('Error cancelling ride:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rides/:id/participants/:riderId - Host remove participant
router.delete('/:id/participants/:riderId', optionalAuth, async (req, res) => {
  const { id: rideId, riderId } = req.params;
  const callerId = req.user ? req.user.id : (req.body.callerId || 'me');

  try {
    const rideCheck = await pool.query(`SELECT host_id FROM rides WHERE id = $1`, [rideId]);
    if (rideCheck.rowCount === 0) return res.status(404).json({ error: 'Ride not found' });

    if (rideCheck.rows[0].host_id !== callerId) {
      return res.status(403).json({ error: 'Only the ride host can remove participants' });
    }

    if (riderId === callerId) {
      return res.status(400).json({ error: 'Host cannot remove themselves from the ride.' });
    }

    await pool.query(`DELETE FROM ride_participants WHERE ride_id = $1 AND rider_id = $2`, [rideId, riderId]);
    const updatedRide = await getFullRide(rideId);
    res.json(updatedRide);
  } catch (err) {
    console.error('Error removing participant:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

