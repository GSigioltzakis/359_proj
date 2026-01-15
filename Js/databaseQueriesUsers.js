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
  }
  return connection;
}

async function getAllUsers() {
  const conn = await getConnection();
  const [rows] = await conn.query('SELECT * FROM users');
  return rows;
}

async function getUserByCredentials(username, password) {
  const conn = await getConnection();
  const [rows] = await conn.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
  return rows;
}
async function checkExistence(field, value) {
  try {
    const conn = await getConnection();
    
    const [userRows] = await conn.execute(
      `SELECT * FROM users WHERE ${field} = ?`, 
      [value]
    );
    
    const [bandRows] = await conn.execute(
      `SELECT * FROM bands WHERE ${field} = ?`, 
      [value]
    );

    //Return true if found in either
    return (userRows.length > 0 || bandRows.length > 0);
  } catch (err) {
    throw new Error('Check error: ' + err.message);
  }
}
async function updateUser(username, newData) {
  try {
    const conn = await getConnection();

    const updateQuery = `
      UPDATE users
      SET password = ?, firstname = ?, lastname = ?, 
          birthdate = ?, gender = ?, country = ?, city = ?, 
          address = ?, telephone = ?, lat = ?, lon = ?
      WHERE username = ?
    `;

    await conn.execute(updateQuery, [
      newData.password,
      newData.firstname,
      newData.lastname,
      newData.birthdate,
      newData.gender,
      newData.country,
      newData.city,
      newData.address,
      newData.telephone,
      newData.lat,
      newData.lon,
      username //where username
    ]);

    return 'User updated successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

// function to get a user's private events 
async function getUserPrivateEvents(user_id) {
  try{

    const conn = await getConnection();
    const [rows] =await conn.execute(`
      SELECT 
        pe.*,
        b.band_name,
        b.photo
      FROM private_events pe
      JOIN bands b ON b.band_id = pe.band_id
      WHERE pe.user_id = ?
      AND pe.status IN ('to be done', 'done')
      ORDER BY pe.event_datetime DESC
      `, [user_id]);
    return rows;
  }catch(err){
    throw new Error('DB error: ' + err.message);
  }
}
// function to mark a private event as done me check thn imerominia
async function markPrivateEventDone(user_id, private_event_id) {
  try{
    const conn = await getConnection();
    const [result] = await conn.execute(`
      UPDATE private_events
      SET status = 'done'
      WHERE private_event_id = ?
      AND user_id = ?
      AND status = 'to be done'
      AND event_datetime < NOW()
    `, [private_event_id, user_id]);
    return result.affectedRows; // 1 αν έγινε update, αλλιώς 0
  }catch(err){
    throw new Error('DB error: ' + err.message);
  }
}



  

module.exports = { 
  getAllUsers, getUserByCredentials, 
  checkExistence, updateUser, getUserPrivateEvents, 
  markPrivateEventDone 
};