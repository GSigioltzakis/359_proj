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

async function deleteUser(username) {
    const conn = await getConnection();
    const [result] = await conn.execute('DELETE FROM users WHERE username = ?', [username]); //delete user by username
    return result.affectedRows > 0; //returns true if a row was deleted
}

async function getPendingReviews() {
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM reviews WHERE status = 'pending'"); //get pending reviews to publish/reject
    return rows;
}

async function getAdminStats() {
    const conn = await getConnection();
    
    //select bands per city
    const [bandsPerCity] = await conn.query("SELECT band_city, COUNT(*) as count FROM bands GROUP BY band_city");
    //gia ta public kai private events, arithmos bands kai users
    const [publicEv] = await conn.query("SELECT COUNT(*) as c FROM public_events");
    const [privateEv] = await conn.query("SELECT COUNT(*) as c FROM private_events");
    const [usersC] = await conn.query("SELECT COUNT(*) as c FROM users");
    const [bandsC] = await conn.query("SELECT COUNT(*) as c FROM bands");
    const [money] = await conn.query("SELECT SUM(price) as total FROM private_events WHERE status = 'done'");
    //an status = done tote o xrhsths exei plhrwsei kai h etairia exei parei to 15%, 
    // episis money[0] dioti einai pinakas me ena antikeimeno
    const profit = (money[0].total || 0) * 0.15;

    return {
        bandsPerCity,
        events: { public: publicEv[0].c, private: privateEv[0].c },
        usersBands: { users: usersC[0].c, bands: bandsC[0].c },
        profit: profit.toFixed(2)
    };
}

module.exports = { deleteUser, getPendingReviews, getAdminStats };