import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import accountRouter from './routes/account.js';
import ridesRouter from './routes/rides.js';
import ridersRouter from './routes/riders.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/account', accountRouter);
app.use('/api/rides', ridesRouter);
app.use('/api/riders', ridersRouter);


// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Initialize Database & Start Express Server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`GET ALONG Backend Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize server:', err);
  });
