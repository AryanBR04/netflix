const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const tmdbRoutes = require('./routes/tmdb');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware - manual CORS to guarantee headers on Vercel serverless
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/tmdb', tmdbRoutes);

// Create Table on Start
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const initDb = async () => {
    try {
        await db.query(createTableQuery);

        // Schema Migration
        await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'User'");
        await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255) DEFAULT '0000000000'");

        // Favorites functionality
        await db.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                movie_id VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                poster_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, movie_id)
            )
        `);

        console.log('PostgreSQL connected and tables verified');
    } catch (err) {
        console.error('Error connecting to database or creating table:', err);
        process.exit(1);
    }
};

// Start Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    initDb().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
}

module.exports = app;
