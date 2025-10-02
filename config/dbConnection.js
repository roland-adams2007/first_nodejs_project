const mysql = require('mysql2/promise');
const dotenv = require('dotenv').config();

let connection;

async function connectDB() {
    if (!connection) {
        try {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME
            });
        } catch (err) {
            console.error('❌ Error connecting to MySQL: ', err);
            process.exit(1);
        }
    }
    return connection;
}

module.exports = connectDB;
