import pool from './db';
import { MOCK_MEMBERS, MOCK_CONTRIBUTIONS, MOCK_MESSAGES, MOCK_EVENTS, MOCK_PHOTOS, MOCK_ROLES, MOCK_PERMISSIONS, MOCK_CONTRIBUTION_TYPES, MOCK_DOC_ARTICLES } from './constants';

const seedDatabase = async () => {
  try {
    console.log('Début du seeding de la base de données...');

    // Drop tables in reverse order of dependency
    await pool.query('DROP TABLE IF EXISTS rsvps CASCADE;');
    await pool.query('DROP TABLE IF EXISTS contributions CASCADE;');
    await pool.query('DROP TABLE IF EXISTS messages CASCADE;');
    await pool.query('DROP TABLE IF EXISTS photos CASCADE;');
    await pool.query('DROP TABLE IF EXISTS events CASCADE;');
    await pool.query('DROP TABLE IF EXISTS doc_articles CASCADE;');
    await pool.query('DROP TABLE IF EXISTS members CASCADE;');
    await pool.query('DROP TABLE IF EXISTS roles CASCADE;');
    await pool.query('DROP TABLE IF EXISTS permissions CASCADE;');
    await pool.query('DROP TABLE IF EXISTS contribution_types CASCADE;');
    console.log('Anciennes tables supprimées.');

    // Create tables
    await pool.query(`
      CREATE TABLE permissions (
        id VARCHAR(50) PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT
      );

      CREATE TABLE roles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        permission_ids VARCHAR(50)[]
      );

      CREATE TABLE contribution_types (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        amount NUMERIC NOT NULL,
        frequency VARCHAR(20) NOT NULL,
        description TEXT
      );

      CREATE TABLE members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        join_date DATE NOT NULL,
        birth_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        avatar TEXT,
        role_id VARCHAR(50) REFERENCES roles(id),
        descendance VARCHAR(100),
        contribution_type_ids VARCHAR(50)[]
      );
      
      CREATE TABLE contributions (
        id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        date DATE NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL
      );

      CREATE TABLE messages (
          id SERIAL PRIMARY KEY,
          sender_id VARCHAR(50) NOT NULL,
          receiver_id VARCHAR(50) NOT NULL,
          text TEXT,
          timestamp TIMESTAMPTZ NOT NULL,
          status VARCHAR(20),
          attachment JSONB
      );
      
      CREATE TABLE events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          time VARCHAR(10),
          location VARCHAR(255),
          description TEXT
      );

      CREATE TABLE rsvps (
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL,
        PRIMARY KEY (event_id, member_id)
      );
      
      CREATE TABLE photos (
          id SERIAL PRIMARY KEY,
          url TEXT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          upload_date TIMESTAMPTZ NOT NULL
      );

      CREATE TABLE doc_articles (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          category VARCHAR(100),
          last_modified TIMESTAMPTZ,
          attachments JSONB
      );
    `);
    console.log('Tables créées avec succès.');
    
    // Insert data
    await Promise.all(MOCK_PERMISSIONS.map(p => pool.query('INSERT INTO permissions (id, category, name, description) VALUES ($1, $2, $3, $4)', [p.id, p.category, p.name, p.description])));
    await Promise.all(MOCK_ROLES.map(r => pool.query('INSERT INTO roles (id, name, description, permission_ids) VALUES ($1, $2, $3, $4)', [r.id, r.name, r.description, r.permissionIds])));
    await Promise.all(MOCK_CONTRIBUTION_TYPES.map(ct => pool.query('INSERT INTO contribution_types (id, name, amount, frequency, description) VALUES ($1, $2, $3, $4, $5)', [ct.id, ct.name, ct.amount, ct.frequency, ct.description])));
    
    // Insert members and get their new IDs
    const memberIdMap = new Map<string, number>(); // Map email to new DB ID
    let memberCounter = 1;
    for (const m of MOCK_MEMBERS) {
      const res = await pool.query('INSERT INTO members (name, email, phone, join_date, birth_date, status, avatar, role_id, descendance, contribution_type_ids) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id', 
        [m.name, m.email, m.phone, m.joinDate, m.birthDate, m.status, m.avatar, m.roleId, m.descendance, m.contributionTypeIds]
      );
      memberIdMap.set(m.email, res.rows[0].id);
      
      // Also map old mock ID to new DB ID for other tables
      memberIdMap.set(`mockId-${memberCounter}`, res.rows[0].id);
      memberCounter++;
    }

    await Promise.all(MOCK_CONTRIBUTIONS.map(c => {
        const newMemberId = memberIdMap.get(`mockId-${c.memberId}`);
        if(newMemberId) {
            return pool.query('INSERT INTO contributions (member_id, amount, date, type, status) VALUES ($1, $2, $3, $4, $5)', [newMemberId, c.amount, c.date, c.type, c.status]);
        }
    }));
    
    await Promise.all(MOCK_EVENTS.map(async (e) => {
        const res = await pool.query('INSERT INTO events (title, date, time, location, description) VALUES ($1, $2, $3, $4, $5) RETURNING id', [e.title, e.date, e.time, e.location, e.description]);
        const eventId = res.rows[0].id;
        if (e.rsvps) {
            await Promise.all(e.rsvps.map(rsvp => {
                const newMemberId = memberIdMap.get(`mockId-${rsvp.memberId}`);
                if (newMemberId) {
                    return pool.query('INSERT INTO rsvps (event_id, member_id, status) VALUES ($1, $2, $3)', [eventId, newMemberId, rsvp.status]);
                }
            }));
        }
    }));

    await Promise.all(MOCK_PHOTOS.map(p => pool.query('INSERT INTO photos (url, title, description, upload_date) VALUES ($1, $2, $3, $4)', [p.url, p.title, p.description, p.uploadDate])));
    await Promise.all(MOCK_DOC_ARTICLES.map(d => pool.query('INSERT INTO doc_articles (id, title, content, category, last_modified, attachments) VALUES ($1, $2, $3, $4, $5, $6)', [d.id, d.title, d.content, d.category, d.lastModified, JSON.stringify(d.attachments || [])])));
    
    // Note: MOCK_MESSAGES seed logic would be more complex due to sender/receiver mapping, skipping for brevity.

    console.log('Données insérées avec succès.');

  } catch (error) {
    console.error('Erreur durant le seeding :', error);
  } finally {
    await pool.end();
    console.log('Connexion à la base de données fermée.');
  }
};

seedDatabase();
