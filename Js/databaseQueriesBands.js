const mysql = require('mysql2/promise');


let connection;

async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "HY359_2025",
    });
    console.log('MySQL connection established.');
  }
  return connection;
}


// New function to retrieve all bands
async function getAllBands() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM bands');
    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function getBandByCredentials(username, password) {
  try {
    const conn = await getConnection();

    const selectQuery = `
      SELECT * FROM bands
      WHERE username = ? AND password = ?
    `;

    const [rows] = await conn.execute(selectQuery, [username, password]);

    return rows; // returns an array of matching bands (likely 0 or 1)
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}


async function updateBand(username, newBandName) {
  try {
    const conn = await getConnection();

    const updateQuery = `
      UPDATE users
      SET band_name = ?
      WHERE username = ?
    `;

    const [result] = await conn.execute(updateQuery, [newBandName, username]);

    if (result.affectedRows === 0) {
      return 'No band found with that username.';
    }

    return 'Firstname updated successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function deleteBand(username) {
  try {
    const conn = await getConnection();

    const deleteQuery = `
      DELETE FROM bands
      WHERE username = ?
    `;

    const [result] = await conn.execute(deleteQuery, [username]);

    if (result.affectedRows === 0) {
      return 'No band found with that username.';
    }

    return 'User deleted successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

//nea functions gia to band dashboard, calendar, requests, chat, earnings.
async function getAllBandEvents(band_id) {
    const conn = await getConnection();
    
    const [publicEv] = await conn.execute(
        `SELECT event_type as title, event_datetime as start, 'public' as type 
         FROM public_events WHERE band_id = ?`, [band_id]
    );
    const [privateEv] = await conn.execute( //accepted private events
        `SELECT event_type as title, event_datetime as start, 'private' as type 
         FROM private_events WHERE band_id = ? AND (status = 'to be done' OR status = 'done')`, [band_id]
    );

    return [...publicEv, ...privateEv];
}

async function getBandRequests(band_id) {
    const conn = await getConnection();
    //sindeoume private_events me users gia na paroume to username tou user pou ekane to request
    const sql = `
        SELECT pe.*, u.username as user_name 
        FROM private_events pe
        JOIN users u ON pe.user_id = u.user_id
        WHERE pe.band_id = ? AND (pe.status = 'requested' OR pe.status = 'to be done')
        ORDER BY pe.event_datetime ASC`;
    const [rows] = await conn.execute(sql, [band_id]);
    return rows;
}

async function updateRequestStatus(event_id, status) {
    const conn = await getConnection();
    await conn.execute(
        'UPDATE private_events SET status = ? WHERE private_event_id = ?', 
        [status, event_id] //status: 'accepted' i 'rejected'
    );
}
//sinartiseis minimaton gia to chat system
async function getMessages(event_id) {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT * FROM messages WHERE private_event_id = ? ORDER BY date_time ASC', [event_id]);
    return rows;
}
async function sendMessage(data) {
    const conn = await getConnection();
    await conn.execute(
        'INSERT INTO messages (private_event_id, message, sender, recipient, date_time) VALUES (?, ?, ?, ?, NOW())',
        [data.event_id, data.message, 'band', 'user']
    );
}

//tora prepei na prosthesoume ta events apo to calendar sto database (h kai to anapodo)
async function addCalendarEvent(data) {
    const conn = await getConnection();
    //mikro paradeigma, prosthetoume to event me default values gia ta pedia pou den exoume
    await conn.execute(
        `INSERT INTO public_events (band_id, event_type, event_description, event_datetime, participants_price, event_city, event_address, event_lat, event_lon)
         VALUES (?, ?, 'Added via Calendar', ?, 0, 'Unknown', 'TBD', 0, 0)`,
        [data.band_id, data.title, data.start]
    );
}
async function getBandEarnings(band_id) {
    const conn = await getConnection();
    // Sum the price of all events marked as 'done'
    const [rows] = await conn.execute(
        "SELECT SUM(price) as total FROM private_events WHERE band_id = ? AND status = 'done'",
        [band_id]
    );
    
    const totalRevenue = rows[0].total || 0;
    return (totalRevenue * 0.85).toFixed(2); //15% commission lol
}
 
 //public event gia calendar + results
async function getPublicEventsForExplore() {
  const conn = await getConnection();

  const [rows] = await conn.execute(`
    SELECT
      public_event_id AS id,
      event_type AS title,
      event_datetime AS start,
      NULL AS end,
      event_city AS city,
      participants_price AS price,
      event_description AS description,
      event_address AS venue,
      event_lat AS lat,
      event_lon AS lng,
      band_id
    FROM public_events
    ORDER BY event_datetime ASC
    LIMIT 500;
  `);

  return rows.map(r => ({
    ...r,
    start: r.start ? new Date(r.start).toISOString() : null,
    end: r.end ? new Date(r.end).toISOString() : null,
    lat: r.lat != null ? Number(r.lat) : null,
    lng: r.lng != null ? Number(r.lng) : null,
    price: r.price != null ? Number(r.price) : 0
  }));
}

// public events gia to map me pin marker
async function getFuturePublicEventsForMap() {
  const conn = await getConnection();

  const [rows] = await conn.execute(`
    SELECT
      public_event_id AS id,
      event_type AS title,
      event_datetime AS start,
      event_city AS city,
      event_address AS venue,
      event_lat AS lat,
      event_lon AS lng
    FROM public_events
    WHERE event_datetime >= NOW()
      AND event_lat IS NOT NULL AND event_lon IS NOT NULL
      AND event_lat <> 0 AND event_lon <> 0
    ORDER BY event_datetime ASC
    LIMIT 500;
  `);

  return rows.map(r => ({
    ...r,
    start: r.start ? new Date(r.start).toISOString() : null,
    lat: Number(r.lat),
    lng: Number(r.lng)
  }));
}

// band filtering function gia to explore me filtra 

// --- NEW: get bands with filters (city, year range, genres) ---
async function getBandsFiltered(filters = {}) {
  try {
    const conn = await getConnection();

    const city = (filters.city ?? '').toString().trim().toLowerCase();
    const yearFrom = filters.year_from ? Number(filters.year_from) : null;
    const yearTo = filters.year_to ? Number(filters.year_to) : null;

    // "rock,pop" -> ["rock","pop"]
    const genres = (filters.genres ?? '')
      .toString()
      .split(',')
      .map(g => g.trim().toLowerCase())
      .filter(Boolean);

    let sql = `
      SELECT
        band_id,
        band_name,
        band_city,
        foundedYear,
        music_genres,
        photo
      FROM bands
      WHERE 1=1
    `;

    const params = [];

    if (city) {
      sql += ` AND LOWER(band_city) LIKE ? `;
      params.push(`%${city}%`);
    }

    if (Number.isFinite(yearFrom)) {
      sql += ` AND foundedYear >= ? `;
      params.push(yearFrom);
    }

    if (Number.isFinite(yearTo)) {
      sql += ` AND foundedYear <= ? `;
      params.push(yearTo);
    }

    // music_genres είναι string "Rock, Blues"
    if (genres.length) {
      sql += ` AND ( ${genres.map(() => `LOWER(music_genres) LIKE ?`).join(' OR ')} ) `;
      genres.forEach(g => params.push(`%${g}%`));
    }

    sql += ` ORDER BY band_name ASC`;

    const [rows] = await conn.execute(sql, params);
    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

// --- NEW: get single band by id (for band profile page) ---
async function getBandById(band_id) {
  try {
    const conn = await getConnection();

    const [rows] = await conn.execute(`
      SELECT
        band_id,
        username,
        band_name,
        band_city,
        foundedYear,
        music_genres,
        photo
      FROM bands
      WHERE band_id = ?
      LIMIT 1
    `, [band_id]);

    return rows[0] || null;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

// --- NEW: get public events for a specific band (for band profile page) ---
async function getBandPublicEventsByBandId(band_id) {
  try {
    const conn = await getConnection();

    const [rows] = await conn.execute(`
      SELECT
        public_event_id AS id,
        event_type AS title,
        event_datetime AS start,
        NULL AS end,
        event_city AS city,
        participants_price AS price,
        event_description AS description,
        event_address AS venue,
        event_lat AS lat,
        event_lon AS lng,
        band_id
      FROM public_events
      WHERE band_id = ?
      ORDER BY event_datetime ASC
      LIMIT 200
    `, [band_id]);

    return rows.map(r => ({
      ...r,
      start: r.start ? new Date(r.start).toISOString() : null,
      end: r.end ? new Date(r.end).toISOString() : null,
      lat: r.lat != null ? Number(r.lat) : null,
      lng: r.lng != null ? Number(r.lng) : null,
      price: r.price != null ? Number(r.price) : 0
    }));
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

//availability slots gia public view for users
async function getBandAvailabilityByBandId(band_id) {
  const conn = await getConnection();
  const [rows] = await conn.execute(`
    SELECT public_event_id AS id,
      event_type AS title,
      event_datetime AS start
    FROM public_events
     WHERE band_id = ?
      AND participants_price = 0
      AND event_description = 'Added via Calendar'
    ORDER BY event_datetime ASC
    LIMIT 500
  `, [band_id]);
  return rows.map(r => ({
    ...r,
    start: r.start ? new Date(r.start).toISOString() : null
  }));
}

function calcPrivatePrice(type){
  const t = (type || '').toLowerCase();
  if (t.includes('bapt')) return 700;
  if (t.includes('wedd')) return 1000;
  if (t.includes('party')) return 500;
  return 500;
}

// user creates private event request
async function createPrivateEventRequest(data){
  const conn = await getConnection();
  const price = calcPrivatePrice(data.event_type);

  const sql = `
    INSERT INTO private_events
      (user_id, band_id, event_type, event_description, event_datetime,
       event_city, event_address, price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'requested')
  `;

  const [result] = await conn.execute(sql, [
    data.user_id,
    data.band_id,
    data.event_type,
    data.event_description || '',
    data.event_datetime,
    data.event_city,
    data.event_address,
    price
  ]);

  return { private_event_id: result.insertId };
}


module.exports = { 
    getBandByCredentials, getAllBandEvents, getBandRequests, 
    updateRequestStatus, getMessages, sendMessage, addCalendarEvent,
    getAllBands, updateBand, deleteBand, getBandEarnings, 
    
    getPublicEventsForExplore, getFuturePublicEventsForMap,
    getBandsFiltered, getBandById, getBandPublicEventsByBandId,
    getBandAvailabilityByBandId, createPrivateEventRequest
};
