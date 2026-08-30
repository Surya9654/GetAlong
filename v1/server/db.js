import pg from 'pg';
import dotenv from 'dotenv';
import { generateMockMapSvg } from './utils/mockMap.js';
dotenv.config();

const { Pool, Client } = pg;

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const dbName = process.env.DB_NAME || 'getalong_db';

// Ensure the database exists
async function ensureDatabaseExists() {
  const client = new Client({ ...config, database: 'postgres' });
  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
    }
  } catch (err) {
    console.warn('Database initialization check warning:', err.message);
  } finally {
    await client.end();
  }
}

await ensureDatabaseExists();

export const pool = new Pool({
  ...config,
  database: dbName,
});

export async function initDb() {
  const client = await pool.connect();
  try {
    console.log('Running database migrations...');
    await client.query('BEGIN');

    // 1. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(20),
        avatar_initial VARCHAR(5) DEFAULT 'A',
        avatar_color VARCHAR(20) DEFAULT '#F2B705',
        bio TEXT,
        city VARCHAR(100) DEFAULT 'Chennai',
        experience_level VARCHAR(50) DEFAULT 'Intermediate',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Rides table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        host_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time VARCHAR(30) NOT NULL,
        distance_km INTEGER,
        difficulty VARCHAR(30) DEFAULT 'cruiser',
        max_riders INTEGER DEFAULT 8,
        description TEXT,
        status VARCHAR(30) DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Route Points (Waypoints / Stops)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ride_points (
        id SERIAL PRIMARY KEY,
        ride_id VARCHAR(50) REFERENCES rides(id) ON DELETE CASCADE,
        stop_order INTEGER NOT NULL,
        point_name VARCHAR(150) NOT NULL
      )
    `);

    // 4. Ride Participants (Junction table - rider_id MUST be a registered user)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ride_participants (
        ride_id VARCHAR(50) REFERENCES rides(id) ON DELETE CASCADE,
        rider_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (ride_id, rider_id)
      )
    `);

    // 5. Group Chat Messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS ride_chat_messages (
        id SERIAL PRIMARY KEY,
        ride_id VARCHAR(50) REFERENCES rides(id) ON DELETE CASCADE,
        rider_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        message_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Ride Reviews
    await client.query(`
      CREATE TABLE IF NOT EXISTS ride_reviews (
        id SERIAL PRIMARY KEY,
        ride_id VARCHAR(50) REFERENCES rides(id) ON DELETE CASCADE,
        rider_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6b. Ride Photos
    await client.query(`
      CREATE TABLE IF NOT EXISTS ride_photos (
        id SERIAL PRIMARY KEY,
        ride_id VARCHAR(50) REFERENCES rides(id) ON DELETE CASCADE,
        uploader_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Motorcycles
    await client.query(`
      CREATE TABLE IF NOT EXISTS motorcycles (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        make VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER,
        engine_cc INTEGER,
        reg_number VARCHAR(30),
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Badges
    await client.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        badge_name VARCHAR(100) NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Preferences
    await client.query(`
      CREATE TABLE IF NOT EXISTS preferences (
        user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        emergency_name VARCHAR(100),
        emergency_phone VARCHAR(20),
        preferred_difficulty VARCHAR(30) DEFAULT 'cruiser',
        notifications_enabled BOOLEAN DEFAULT true
      )
    `);

    // Schema Enhancements & Gap Fixes (Migrations for existing DBs)
    await client.query(`ALTER TABLE rides ADD COLUMN IF NOT EXISTS route_svg TEXT`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
    await client.query(`ALTER TABLE ride_points ADD COLUMN IF NOT EXISTS distance_from_start_km INTEGER DEFAULT 0`);
    await client.query(`ALTER TABLE ride_points ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await client.query(`ALTER TABLE ride_participants ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'approved'`);

    // Unique constraint on ride reviews (prevent multiple reviews per ride by same rider)
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_ride_reviewer') THEN 
          ALTER TABLE ride_reviews ADD CONSTRAINT unique_ride_reviewer UNIQUE (ride_id, rider_id); 
        END IF; 
      END $$;
    `);

    // Performance Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rides_status_date ON rides(status, date)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_participants_rider ON ride_participants(rider_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_ride ON ride_chat_messages(ride_id, created_at)`);

    // Seed default users
    console.log('Seeding initial riders into PostgreSQL...');

    const riders = [
      ['me', 'Arjun Kumar', 'arjun@getalong.ride', '+91 98765 43210', 'A', '#F2B705', 'Weekend rider. Coastal roads over highways, always.', 'Chennai', 'Intermediate'],
      ['r2', 'Priya Nair', 'priya@getalong.ride', '+91 98765 43211', 'P', '#D9622B', 'Touring since 2018. ECR regular, breakfast-stop connoisseur.', 'Chennai', 'Advanced / Marshal'],
      ['r3', 'Karthik R', 'karthik@getalong.ride', '+91 98765 43212', 'K', '#7A9B5C', 'Himalayan owner. Ghat roads over highways, every time.', 'Vellore', 'Advanced / Marshal'],
      ['r4', 'Fathima S', 'fathima@getalong.ride', '+91 98765 43213', 'F', '#5B8FA8', 'New rider, still learning the ropes. Always up for a cruiser run.', 'Chennai', 'Beginner'],
      ['r5', 'Vignesh M', 'vignesh@getalong.ride', '+91 98765 43214', 'V', '#B968C7', 'Group ride organizer. Safety briefing before every start.', 'Chennai', 'Advanced / Marshal'],
    ];

    for (const r of riders) {
      await client.query(`
        INSERT INTO users (id, name, email, phone, avatar_initial, avatar_color, bio, city, experience_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, r);
    }


      // Seed motorcycles
      await client.query(`
        INSERT INTO motorcycles (user_id, make, model, year, engine_cc, reg_number, is_primary)
        VALUES 
          ('me', 'Royal Enfield', 'Himalayan 450', 2024, 452, 'TN-07-CB-4520', true),
          ('me', 'KTM', 'Duke 390', 2022, 373, 'TN-07-AB-3900', false),
          ('r2', 'Royal Enfield', 'Interceptor 650', 2023, 648, 'TN-07-PR-6500', true),
          ('r3', 'Royal Enfield', 'Himalayan 411', 2021, 411, 'TN-23-KR-4110', true),
          ('r4', 'Triumph', 'Speed 400', 2024, 398, 'TN-07-FS-4000', true),
          ('r5', 'BMW', 'G 310 GS', 2023, 313, 'TN-07-VM-3100', true)
      `);

      // Seed badges
      await client.query(`
        INSERT INTO badges (user_id, badge_name)
        VALUES 
          ('me', 'Early bird'), ('me', 'Coastal Explorer'), ('me', 'Night rider'),
          ('r2', 'Trailblazer'), ('r2', '100+ rides hosted'),
          ('r3', 'Night rider'), ('r3', 'Mountain Specialist'),
          ('r5', 'Marshal'), ('r5', 'Safety First')
      `);

      // Seed preferences
      await client.query(`
        INSERT INTO preferences (user_id, emergency_name, emergency_phone, preferred_difficulty, notifications_enabled)
        VALUES ('me', 'Rohan (Brother)', '+91 99887 76655', 'spirited', true)
        ON CONFLICT (user_id) DO NOTHING
      `);

    // Seed initial rides if not existing
    const rideCheck = await client.query(`SELECT COUNT(*) FROM rides`);

    if (parseInt(rideCheck.rows[0].count, 10) === 0) {
      console.log('Seeding initial group rides into PostgreSQL...');
      const initialRides = [
        {
          id: 'ride1', title: 'ECR Sunrise Run', hostId: 'r2', date: '2026-09-06', time: '5:30 AM',
          points: ['Chennai (ECR start)', 'Mahabalipuram', 'Pondicherry'], distanceKm: 160, difficulty: 'cruiser', maxRiders: 10,
          currentRiders: ['r2', 'r3', 'me'],
          description: 'Early start to beat the heat. We roll out from the ECR toll gate and keep a relaxed pace down to Mahabs for filter coffee, then push on to Pondy for lunch. Back by evening. Fuel up before you arrive, first stop is 40km in.',
          status: 'upcoming',
          chat: [
            { riderId: 'r2', text: 'Meeting at the ECR toll gate, 5:15 sharp. Fuel up before you arrive!' },
            { riderId: 'r3', text: 'In. Bringing a spare helmet if anyone needs one.' },
          ],
          reviews: []
        },
        {
          id: 'ride2', title: 'Yelagiri Ghat Loop', hostId: 'r5', date: '2026-09-13', time: '6:00 AM',
          points: ['Chennai', 'Vellore', 'Yelagiri Hills'], distanceKm: 230, difficulty: 'spirited', maxRiders: 8,
          currentRiders: ['r5', 'r4'],
          description: 'Fourteen hairpins up, fourteen back down. Regroup at every third bend, no exceptions. Lake-side lunch at the top before we head back. Decent tyres recommended, the last 6km get loose in patches.',
          status: 'upcoming', chat: [], reviews: []
        },
        {
          id: 'ride3', title: 'Kolli Hills Hairpin Hunt', hostId: 'r3', date: '2026-09-20', time: '5:00 AM',
          points: ['Chennai', 'Namakkal', 'Kolli Hills (70 hairpins)'], distanceKm: 360, difficulty: 'hardcore', maxRiders: 6,
          currentRiders: ['r3'],
          description: 'Long day in the saddle. All 70 numbered hairpins, one shot, no skipping the top viewpoint. This one is for riders comfortable with tight switchbacks and long stretches — not a first-timer route.',
          status: 'upcoming', chat: [], reviews: []
        },
        {
          id: 'ride4', title: 'Pondy Coastal Cruise', hostId: 'r2', date: '2026-08-02', time: '6:00 AM',
          points: ['Chennai', 'ECR', 'Pondicherry'], distanceKm: 170, difficulty: 'cruiser', maxRiders: 10,
          currentRiders: ['r2', 'me', 'r4'],
          description: 'Easy coastal cruise down ECR with a proper breakfast stop and a slow return before traffic picked up.',
          status: 'completed',
          chat: [
            { riderId: 'r2', text: 'That breakfast stop at the beach shack was perfect timing.' },
            { riderId: 'me', text: 'Agreed, best filter coffee on ECR.' },
            { riderId: 'r4', text: 'Thanks for waiting up on the bends, Priya!' },
          ],
          reviews: [
            { riderId: 'me', rating: 5, comment: 'Great pace, well organized, and that breakfast stop made the ride.' },
            { riderId: 'r4', rating: 4, comment: 'Fun ride overall, wish we started a little later though.' },
          ]
        }
      ];

      for (const r of initialRides) {
        const rideSvg = r.points && r.points.length >= 2
          ? generateMockMapSvg(r.points, r.distanceKm || null)
          : null;

        await client.query(`
          INSERT INTO rides (id, title, host_id, date, time, distance_km, difficulty, max_riders, description, status, route_svg)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO NOTHING
        `, [r.id, r.title, r.hostId, r.date, r.time, r.distanceKm, r.difficulty, r.maxRiders, r.description, r.status, rideSvg]);


        for (let i = 0; i < r.points.length; i++) {
          await client.query(`
            INSERT INTO ride_points (ride_id, stop_order, point_name)
            VALUES ($1, $2, $3)
          `, [r.id, i, r.points[i]]);
        }

        for (const riderId of r.currentRiders) {
          await client.query(`
            INSERT INTO ride_participants (ride_id, rider_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [r.id, riderId]);
        }

        for (const msg of r.chat) {
          await client.query(`
            INSERT INTO ride_chat_messages (ride_id, rider_id, message_text)
            VALUES ($1, $2, $3)
          `, [r.id, msg.riderId, msg.text]);
        }

        for (const rev of r.reviews) {
          await client.query(`
            INSERT INTO ride_reviews (ride_id, rider_id, rating, comment)
            VALUES ($1, $2, $3, $4)
          `, [r.id, rev.riderId, rev.rating, rev.comment]);
        }
      }
    }

    // Backfill route_svg for any existing rides that are missing it
    const noSvgRides = await client.query(`SELECT id FROM rides WHERE route_svg IS NULL`);
    if (noSvgRides.rowCount > 0) {
      console.log(`Backfilling route_svg for ${noSvgRides.rowCount} existing ride(s)...`);
      for (const row of noSvgRides.rows) {
        const pts = await client.query(
          `SELECT point_name FROM ride_points WHERE ride_id = $1 ORDER BY stop_order ASC`,
          [row.id]
        );
        const kmRow = await client.query(`SELECT distance_km FROM rides WHERE id = $1`, [row.id]);
        const pointNames = pts.rows.map(p => p.point_name);
        const distKm = kmRow.rows[0]?.distance_km || null;
        if (pointNames.length >= 2) {
          const svg = generateMockMapSvg(pointNames, distKm);
          await client.query(`UPDATE rides SET route_svg = $1 WHERE id = $2`, [svg, row.id]);
        }
      }
    }

    await client.query('COMMIT');
    console.log('Database tables & initial seeds ready!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
  }
}
