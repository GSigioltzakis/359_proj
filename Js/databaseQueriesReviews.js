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

async function createReview(reviewData) {
    const conn = await getConnection();
    
    //check if band exists first
    const [bandRows] = await conn.execute('SELECT * FROM bands WHERE band_id = ?', [reviewData.band_id]);
    if (bandRows.length === 0) {
        throw new Error("Band not found");
    }

    const query = `
        INSERT INTO reviews (band_id, sender, review, rating, status, date_time)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await conn.execute(query, [
        reviewData.band_id,
        reviewData.sender,
        reviewData.review,
        reviewData.rating,
        'pending', //default status
        new Date() //current datetime
    ]);
    
    return result.insertId;
}

async function getReviews(bandName, ratingFrom, ratingTo) {
    const conn = await getConnection();
    let query = "SELECT * FROM reviews WHERE status = 'published'";
    const params = [];

    if (bandName !== 'all') {
        query += " AND band_id = ?";
        params.push(bandName);
    }

    if (ratingFrom) {
        query += " AND rating >= ?";
        params.push(ratingFrom);
    }

    if (ratingTo) {
        query += " AND rating <= ?";
        params.push(ratingTo);
    }

    const [rows] = await conn.execute(query, params);
    return rows;
}
async function updateReviewStatus(reviewId, newStatus) {
    const conn = await getConnection();
    const query = "UPDATE reviews SET status = ? WHERE review_id = ? AND status = 'pending'";
    const [result] = await conn.execute(query, [newStatus, reviewId]);
    
    return result.affectedRows > 0;
}

async function deleteReview(reviewId) {
    const conn = await getConnection();
    const query = "DELETE FROM reviews WHERE review_id = ?";
    const [result] = await conn.execute(query, [reviewId]);
    
    return result.affectedRows > 0;
}

module.exports = { createReview, getReviews, updateReviewStatus, deleteReview };