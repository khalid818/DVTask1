// server.js
const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true // Change to true for local dev / self-signed certs
  }
};

// Connect to database
sql.connect(dbConfig).then(pool => {
    if (pool.connected) {
        console.log('Connected to MSSQL');
    }
}).catch(err => {
    console.error('Database connection failed', err);
});

app.use(express.static('public'));
app.use(express.json());

// Route to handle button actions
app.post('/action', async (req, res) => {
    const { action } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('action', sql.VarChar, action)
            .query('INSERT INTO Commands (command) VALUES (@action)');
        
        res.status(200).send('Action stored successfully');
    } catch (err) {
        console.error('Error storing action', err);
        res.status(500).send('Error storing action');
    }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});