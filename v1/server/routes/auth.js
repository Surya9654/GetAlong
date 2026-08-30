import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { requireAuth, JWT_SECRET } from '../middleware/auth.js';


const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new rider account
 */
router.post('/register', async (req, res) => {
  const { name, email, password, city, experience_level } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = `rider_${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const initial = name.charAt(0).toUpperCase();
    const colors = ['#F2B705', '#D9622B', '#7A9B5C', '#5B8FA8', '#B968C7'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, avatar_initial, avatar_color, city, experience_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, name, email, hashedPassword, initial, avatarColor, city || 'Chennai', experience_level || 'Intermediate']
    );

    // Initialize default preferences
    await pool.query(
      `INSERT INTO preferences (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
      [userId]
    );

    const token = jwt.sign({ id: userId, name, email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: { id: userId, name, email, avatar_initial: initial, avatar_color: avatarColor, city: city || 'Chennai', experience_level: experience_level || 'Intermediate' }
    });
  } catch (err) {
    console.error('Error in /api/auth/register:', err);
    return res.status(500).json({ error: 'Server error registering user.' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate existing rider and issue JWT token
 */
router.post('/login', async (req, res) => {
  const { email, password, userId } = req.body;

  try {
    let user;
    if (userId === 'me') {
      // Demo convenience login for default rider 'me' (Arjun)
      const result = await pool.query('SELECT * FROM users WHERE id = $1', ['me']);
      user = result.rows[0];
    } else if (email) {
      const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      user = result.rows[0];
      if (user && user.password_hash && password) {
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found. Please register or select a valid profile.' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_initial: user.avatar_initial,
        avatar_color: user.avatar_color,
        bio: user.bio,
        city: user.city,
        experience_level: user.experience_level
      }
    });
  } catch (err) {
    console.error('Error in /api/auth/login:', err);
    return res.status(500).json({ error: 'Server error authenticating user.' });
  }
});

/**
 * GET /api/auth/me
 * Fetch currently authenticated user session
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, avatar_initial, avatar_color, bio, city, experience_level FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User session not found.' });
    }
    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error in /api/auth/me:', err);
    return res.status(500).json({ error: 'Server error fetching user session.' });
  }
});

export default router;
