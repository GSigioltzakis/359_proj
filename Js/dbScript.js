// scriptaki gia na valei ola ta dedomena apo to resource.js sto database
const mysql = require('mysql2/promise');
// Import the data from your resources file
const {users, bands, public_events, reviews, private_events, messages } = require('./resources.js');

async function seedDatabase() {
    // 1. Create Connection
    const conn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "HY359_2025",
    });

    console.log("Connected to database. Starting import...");

    try {
        // ==================================================
        // 1. IMPORT USERS
        // ==================================================
        console.log(`Processing ${users.length} Users...`);
        for (const u of users) {
            // INSERT IGNORE skips the row if 'username' or 'email' already exists
            await conn.execute(`
                INSERT IGNORE INTO users 
                (username, email, password, firstname, lastname, birthdate, gender, country, city, address, telephone, lat, lon)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [u.username, u.email, u.password, u.firstname, u.lastname, u.birthdate, u.gender, u.country, u.city, u.address, u.telephone, u.lat, u.lon]);
        }

        // ==================================================
        // 2. IMPORT BANDS
        // ==================================================
        console.log(`Processing ${bands.length} Bands...`);
        for (const b of bands) {
            // We explicitly insert band_id to match the resources.js relationships
            await conn.execute(`
                INSERT IGNORE INTO bands 
                (band_id, username, email, password, band_name, music_genres, band_description, members_number, foundedYear, band_city, telephone, webpage, photo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [b.band_id, b.username, b.email, b.password, b.band_name, b.music_genres, b.band_description, b.members_number, b.foundedYear, b.band_city, b.telephone, b.webpage, b.photo]);
        }

        // ==================================================
        // 3. IMPORT PUBLIC EVENTS
        // ==================================================
        console.log(`Processing ${public_events.length} Public Events...`);
        for (const pe of public_events) {
            await conn.execute(`
                INSERT IGNORE INTO public_events 
                (band_id, event_type, event_description, event_datetime, participants_price, event_city, event_address, event_lat, event_lon)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [pe.band_id, pe.event_type, pe.event_description, pe.event_datetime, pe.participants_price, pe.event_city, pe.event_address, pe.event_lat, pe.event_lon]);
        }

        // ==================================================
        // 4. IMPORT REVIEWS
        // ==================================================
        console.log(`Processing ${reviews.length} Reviews...`);
        for (const r of reviews) {
            await conn.execute(`
                INSERT IGNORE INTO reviews 
                (band_name, sender, review, rating, date_time, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [r.band_name, r.sender, r.review, r.rating, r.date_time, r.status || 'pending']);
        }

        // ==================================================
        // 5. IMPORT PRIVATE EVENTS
        // ==================================================
        // Note: resources.js assumes specific User IDs exist. 
        // Since we imported Users first, this should link up correctly unless IDs shifted.
        console.log(`Processing ${private_events.length} Private Events...`);
        for (const pe of private_events) {
            await conn.execute(`
                INSERT INTO private_events 
                (band_id, user_id, event_type, event_datetime, event_description, price, status, event_city, event_address, event_lat, event_lon, band_decision)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 35.0, 25.0, ?)
            `, [pe.band_id, pe.user_id, pe.event_type, pe.event_datetime, pe.event_description, pe.price, pe.status, pe.event_city, pe.event_address, pe.band_decision]);
        }

        // ==================================================
        // 6. IMPORT MESSAGES
        // ==================================================
        console.log(`Processing ${messages.length} Messages...`);
        for (const m of messages) {
            await conn.execute(`
                INSERT INTO messages 
                (private_event_id, message, sender, recipient, date_time)
                VALUES (?, ?, ?, ?, ?)
            `, [m.private_event_id, m.message, m.sender, m.recipient, m.date_time]);
        }

        console.log("✅ SUCCESS: Data imported without overwriting existing entries.");

    } catch (err) {
        console.error("❌ ERROR:", err.message);
    } finally {
        conn.end();
    }
}

seedDatabase();