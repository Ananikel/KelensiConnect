import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pool from './db';
import type { Member, Contribution, ChatMessage, AppEvent, Photo, Role, Permission, ContributionType, DocArticle } from './types';


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint de test
app.get('/api', (req, res) => {
  res.send('API KelensiConnect est en cours d\'exécution !');
});

// --- API Endpoints ---

// GET all data
app.get('/api/all-data', async (req, res) => {
    try {
        const [
            members,
            contributions,
            messages,
            events,
            photos,
            roles,
            permissions,
            contributionTypes,
            docArticles
        ] = await Promise.all([
            pool.query('SELECT * FROM members ORDER BY name ASC'),
            pool.query('SELECT c.*, m.name as member_name FROM contributions c JOIN members m ON c.member_id = m.id ORDER BY date DESC'),
            pool.query('SELECT * FROM messages ORDER BY timestamp ASC'),
            pool.query('SELECT * FROM events ORDER BY date DESC'),
            pool.query('SELECT * FROM photos ORDER BY upload_date DESC'),
            pool.query('SELECT * FROM roles ORDER BY name ASC'),
            pool.query('SELECT * FROM permissions ORDER BY category, name'),
            pool.query('SELECT * FROM contribution_types ORDER BY name ASC'),
            pool.query('SELECT * FROM doc_articles ORDER BY title ASC')
        ]);

        // Process rsvps for events
        const eventIds = events.rows.map(e => e.id);
        const rsvpsResult = await pool.query('SELECT * FROM rsvps WHERE event_id = ANY($1::int[])', [eventIds]);
        
        const eventsWithRsvps = events.rows.map(event => ({
            ...event,
            rsvps: rsvpsResult.rows.filter(rsvp => rsvp.event_id === event.id).map(r => ({ memberId: r.member_id, status: r.status }))
        }));


        res.json({
            members: members.rows,
            contributions: contributions.rows.map(c => ({...c, memberName: c.member_name})), // Snake_case to camelCase
            messages: messages.rows,
            events: eventsWithRsvps,
            photos: photos.rows,
            roles: roles.rows,
            permissions: permissions.rows,
            contributionTypes: contributionTypes.rows,
            docArticles: docArticles.rows,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des données" });
    }
});


// Members
app.post('/api/members', async (req, res) => {
    try {
        const newMember: Omit<Member, 'id'> = req.body;
        const { name, email, phone, joinDate, birthDate, status, avatar, roleId, descendance, contributionTypeIds } = newMember;
        const result = await pool.query(
            'INSERT INTO members (name, email, phone, join_date, birth_date, status, avatar, role_id, descendance, contribution_type_ids) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [name, email, phone, joinDate, birthDate, status, avatar, roleId, descendance, contributionTypeIds || []]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.put('/api/members/:id', async (req, res) => {
     try {
        const { id } = req.params;
        const updatedMember: Member = req.body;
        const { name, email, phone, status, roleId, descendance, birthDate, contributionTypeIds } = updatedMember;
        const result = await pool.query(
            'UPDATE members SET name = $1, email = $2, phone = $3, status = $4, role_id = $5, descendance = $6, birth_date = $7, contribution_type_ids = $8 WHERE id = $9 RETURNING *',
            [name, email, phone, status, roleId, descendance, birthDate, contributionTypeIds || [], id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Membre non trouvé" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.delete('/api/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
             return res.status(404).json({ error: "Membre non trouvé" });
        }
        res.status(204).send(); // No content
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Add other endpoints for finances, events, etc. following the same pattern.

app.listen(port, () => {
  console.log(`Le serveur backend est en cours d'exécution sur http://localhost:${port}`);
});
