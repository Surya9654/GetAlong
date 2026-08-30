import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/account - Fetch full account profile, motorcycles, badges, and preferences for authenticated user
router.get('/', optionalAuth, async (req, res) => {
  const userId = req.user ? req.user.id : 'me'; // Default fallback for guest view
  try {
    const userRes = await pool.query(`SELECT id, name, email, phone, avatar_initial, avatar_color, bio, city, experience_level FROM users WHERE id = $1`, [userId]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRes.rows[0];

    const bikesRes = await pool.query(`SELECT * FROM motorcycles WHERE user_id = $1 ORDER BY is_primary DESC, id ASC`, [userId]);
    const badgesRes = await pool.query(`SELECT * FROM badges WHERE user_id = $1 ORDER BY id ASC`, [userId]);
    const prefRes = await pool.query(`SELECT * FROM preferences WHERE user_id = $1`, [userId]);

    res.json({
      user,
      motorcycles: bikesRes.rows,
      badges: badgesRes.rows,
      preferences: prefRes.rows[0] || {},
    });
  } catch (err) {
    console.error('Error fetching account:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/account/profile - Update rider profile information (Requires Auth)
router.put('/profile', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { name, bio, city, experience_level, email, phone } = req.body;
  try {
    const updated = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           city = COALESCE($3, city),
           experience_level = COALESCE($4, experience_level),
           email = COALESCE($5, email),
           phone = COALESCE($6, phone)
       WHERE id = $7
       RETURNING id, name, email, phone, avatar_initial, avatar_color, bio, city, experience_level`,
      [name, bio, city, experience_level, email, phone, userId]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/account/bikes - Add motorcycle to garage (Requires Auth)
router.post('/bikes', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { make, model, year, engine_cc, reg_number, is_primary } = req.body;
  try {
    if (is_primary) {
      await pool.query(`UPDATE motorcycles SET is_primary = false WHERE user_id = $1`, [userId]);
    }
    const newBike = await pool.query(
      `INSERT INTO motorcycles (user_id, make, model, year, engine_cc, reg_number, is_primary)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, make, model, year || null, engine_cc || null, reg_number || '', !!is_primary]
    );
    res.status(201).json(newBike.rows[0]);
  } catch (err) {
    console.error('Error adding bike:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/account/bikes/:id - Update bike or toggle primary (Requires Auth)
router.put('/bikes/:id', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { make, model, year, engine_cc, reg_number, is_primary } = req.body;
  try {
    if (is_primary) {
      await pool.query(`UPDATE motorcycles SET is_primary = false WHERE user_id = $1`, [userId]);
    }
    const updatedBike = await pool.query(
      `UPDATE motorcycles 
       SET make = COALESCE($1, make),
           model = COALESCE($2, model),
           year = COALESCE($3, year),
           engine_cc = COALESCE($4, engine_cc),
           reg_number = COALESCE($5, reg_number),
           is_primary = COALESCE($6, is_primary)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [make, model, year, engine_cc, reg_number, is_primary, id, userId]
    );
    res.json(updatedBike.rows[0]);
  } catch (err) {
    console.error('Error updating bike:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/account/bikes/:id - Delete motorcycle (Requires Auth)
router.delete('/bikes/:id', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM motorcycles WHERE id = $1 AND user_id = $2`, [id, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting bike:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/account/preferences - Save emergency contact & settings (Requires Auth)
router.put('/preferences', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { emergency_name, emergency_phone, preferred_difficulty, notifications_enabled } = req.body;
  try {
    const updated = await pool.query(
      `INSERT INTO preferences (user_id, emergency_name, emergency_phone, preferred_difficulty, notifications_enabled)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE 
       SET emergency_name = EXCLUDED.emergency_name,
           emergency_phone = EXCLUDED.emergency_phone,
           preferred_difficulty = EXCLUDED.preferred_difficulty,
           notifications_enabled = EXCLUDED.notifications_enabled
       RETURNING *`,
      [userId, emergency_name, emergency_phone, preferred_difficulty, notifications_enabled]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Error saving preferences:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

