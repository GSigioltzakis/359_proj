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

module.exports = { 
    getBandByCredentials, getAllBandEvents, getBandRequests, 
    updateRequestStatus, getMessages, sendMessage, addCalendarEvent, getAllBands, updateBand, deleteBand, getBandEarnings
};
