import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/riders - List all riders
router.get('/', async (req, res) => {
  try {
    const usersRes = await pool.query(`SELECT * FROM users ORDER BY created_at ASC`);
    const riders = await Promise.all(
      usersRes.rows.map(async (u) => {
        const badgesRes = await pool.query(`SELECT badge_name FROM badges WHERE user_id = $1`, [u.id]);
        return {
          id: u.id,
          name: u.name,
          avatar: u.avatar_initial,
          color: u.avatar_color,
          bio: u.bio,
          badges: badgesRes.rows.map(b => b.badge_name),
          city: u.city,
          experienceLevel: u.experience_level,
        };
      })
    );
    res.json(riders);
  } catch (err) {
    console.error('Error fetching riders:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/riders/:id - Fetch single rider profile
router.get('/:id', async (req, res) => {
  try {
    const userRes = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.params.id]);
    if (userRes.rowCount === 0) return res.status(404).json({ error: 'Rider not found' });
    const u = userRes.rows[0];

    const badgesRes = await pool.query(`SELECT badge_name FROM badges WHERE user_id = $1`, [u.id]);
    res.json({
      id: u.id,
      name: u.name,
      avatar: u.avatar_initial,
      color: u.avatar_color,
      bio: u.bio,
      badges: badgesRes.rows.map(b => b.badge_name),
      city: u.city,
      experienceLevel: u.experience_level,
    });
  } catch (err) {
    console.error('Error fetching rider profile:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
