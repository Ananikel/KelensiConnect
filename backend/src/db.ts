import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connecté à la base de données PostgreSQL !');
});

pool.on('error', (err) => {
    console.error('Erreur de connexion à la base de données', err);
    // FIX: Cast process to any to fix TypeScript error for `process.exit`.
    (process as any).exit(-1);
});

export default pool;