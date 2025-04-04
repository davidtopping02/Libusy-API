const mysql = require('mysql2/promise');
const config = require('../config');

// Create connection pool
const pool = mysql.createPool(config.db);

async function query(sql, params) {
    const connection = await pool.getConnection(); // Get a connection from the pool
    try {
        const [results,] = await connection.execute(sql, params);
        return results;
    } finally {
        connection.release(); // Release the connection back to the pool
    }
}

module.exports = {
    query
};
