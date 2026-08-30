import { getGoogleMapsApiKey } from './googleMapsLoader.js';

/**
 * Computes road driving route between origin, destination, and optional intermediate stops.
 * Uses Google Routes API v2 with automatic fallback to OpenStreetMap OSRM.
 *
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @param {Array<{ lat: number, lng: number }>} [intermediates]
 * @returns {Promise<{ polyline: string, distanceKm: number, path: Array<{lat: number, lng: number}> }>}
 */
export async function computeDrivingRoute(origin, destination, intermediates = []) {
  if (!origin || !destination) {
    throw new Error('Origin and destination are required');
  }

  const apiKey = getGoogleMapsApiKey();

  // 1. Try Google Routes API v2
  try {
    const payload = {
      origin: {
        location: { latLng: { latitude: Number(origin.lat), longitude: Number(origin.lng) } },
      },
      destination: {
        location: { latLng: { latitude: Number(destination.lat), longitude: Number(destination.lng) } },
      },
      travelMode: 'DRIVE',
    };

    if (Array.isArray(intermediates) && intermediates.length > 0) {
      payload.intermediates = intermediates.map((item) => ({
        location: { latLng: { latitude: Number(item.lat), longitude: Number(item.lng) } },
      }));
    }

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distanceKm = Math.round(route.distanceMeters / 1000);
        const encodedPolyline = route.polyline?.encodedPolyline || '';
        const path = decodePolyline(encodedPolyline);
        return {
          provider: 'google_routes',
          distanceKm,
          polyline: encodedPolyline,
          path,
        };
      }
    }
  } catch (err) {
    console.warn('Google Routes API fetch failed, trying OSRM fallback:', err);
  }

  // 2. High-performance fallback: OpenStreetMap OSRM
  try {
    const allPoints = [origin, ...(intermediates || []), destination];
    const coordsStr = allPoints.map((p) => `${p.lng},${p.lat}`).join(';');
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=polyline`;

    const osrmRes = await fetch(osrmUrl);
    if (osrmRes.ok) {
      const osrmData = await osrmRes.json();
      if (osrmData.routes && osrmData.routes[0]) {
        const route = osrmData.routes[0];
        const distanceKm = Math.round(route.distance / 1000);
        const encodedPolyline = route.geometry || '';
        const path = decodePolyline(encodedPolyline);
        return {
          provider: 'osrm',
          distanceKm,
          polyline: encodedPolyline,
          path,
        };
      }
    }
  } catch (osrmErr) {
    console.warn('OSRM route fetch failed:', osrmErr);
  }

  throw new Error('Unable to compute driving route');
}

/**
 * Polyline decoder algorithm for Google encoded polylines.
 * Returns array of { lat, lng } objects.
 */
export function decodePolyline(encoded) {
  if (!encoded) return [];
  const points = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}
