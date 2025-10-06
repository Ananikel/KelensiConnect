import pool from './db';
import { MOCK_MEMBERS, MOCK_CONTRIBUTIONS, MOCK_EVENTS, MOCK_PHOTOS, MOCK_ROLES, MOCK_PERMISSIONS, MOCK_CONTRIBUTION_TYPES, MOCK_DOC_ARTICLES } from './constants';

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Début du seeding de la base de données...');

    // Drop tables in reverse order of dependency
    await client.query('DROP TABLE IF EXISTS rsvps CASCADE;');
    await client.query('DROP TABLE IF EXISTS contributions CASCADE;');
    await client.query('DROP TABLE IF EXISTS messages CASCADE;');
    await client.query('DROP TABLE IF EXISTS photos CASCADE;');
    await client.query('DROP TABLE IF EXISTS events CASCADE;');
    await client.query('DROP TABLE IF EXISTS doc_articles CASCADE;');
    await client.query('DROP TABLE IF EXISTS members CASCADE;');
    await client.query('DROP TABLE IF EXISTS roles CASCADE;');
    await client.query('DROP TABLE IF EXISTS permissions CASCADE;');
    await client.query('DROP TABLE IF EXISTS contribution_types CASCADE;');
    console.log('Anciennes tables supprimées.');

    // Create tables
    await client.query(`
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
        member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
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
    
    // Insert static data
    for (const p of MOCK_PERMISSIONS) await client.query('INSERT INTO permissions (id, category, name, description) VALUES ($1, $2, $3, $4)', [p.id, p.category, p.name, p.description]);
    for (const r of MOCK_ROLES) await client.query('INSERT INTO roles (id, name, description, permission_ids) VALUES ($1, $2, $3, $4)', [r.id, r.name, r.description, r.permissionIds]);
    for (const ct of MOCK_CONTRIBUTION_TYPES) await client.query('INSERT INTO contribution_types (id, name, amount, frequency, description) VALUES ($1, $2, $3, $4, $5)', [ct.id, ct.name, ct.amount, ct.frequency, ct.description]);
    
    // Insert members and create a map from old mockId to new database ID
    const memberIdMap = new Map<number, number>();
    for (const m of MOCK_MEMBERS) {
      const res = await client.query(
        'INSERT INTO members (name, email, phone, join_date, birth_date, status, avatar, role_id, descendance, contribution_type_ids) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id', 
        [m.name, m.email, m.phone, m.joinDate, m.birthDate, m.status, m.avatar, m.roleId, m.descendance, m.contributionTypeIds]
      );
      memberIdMap.set(m.mockId, res.rows[0].id);
    }

    // Insert contributions using the new member IDs
    for (const c of MOCK_CONTRIBUTIONS) {
        const newMemberId = memberIdMap.get(c.memberId);
        if(newMemberId) {
            await client.query('INSERT INTO contributions (member_id, amount, date, type, status) VALUES ($1, $2, $3, $4, $5)', [newMemberId, c.amount, c.date, c.type, c.status]);
        }
    }
    
    // Insert events and their RSVPs
    for (const e of MOCK_EVENTS) {
        const res = await client.query('INSERT INTO events (title, date, time, location, description) VALUES ($1, $2, $3, $4, $5) RETURNING id', [e.title, e.date, e.time, e.location, e.description]);
        const eventId = res.rows[0].id;
        if (e.rsvps) {
            for (const rsvp of e.rsvps) {
                const newMemberId = memberIdMap.get(rsvp.memberId);
                if (newMemberId) {
                    await client.query('INSERT INTO rsvps (event_id, member_id, status) VALUES ($1, $2, $3)', [eventId, newMemberId, rsvp.status]);
                }
            }
        }
    }

    for (const p of MOCK_PHOTOS) await client.query('INSERT INTO photos (url, title, description, upload_date) VALUES ($1, $2, $3, $4)', [p.url, p.title, p.description, p.uploadDate]);
    for (const d of MOCK_DOC_ARTICLES) await client.query('INSERT INTO doc_articles (id, title, content, category, last_modified, attachments) VALUES ($1, $2, $3, $4, $5, $6)', [d.id, d.title, d.content, d.category, d.lastModified, JSON.stringify(d.attachments || [])]);
    
    await client.query('COMMIT');
    console.log('Données insérées avec succès.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur durant le seeding, rollback effectué :', error);
  } finally {
    client.release();
    console.log('Client de base de données libéré.');
  }
};

seedDatabase().finally(() => pool.end());
