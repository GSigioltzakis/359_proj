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

module.exports = { getAllUsers, getUserByCredentials, checkExistence, updateUser };