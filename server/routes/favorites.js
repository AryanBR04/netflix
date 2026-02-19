const router = require('express').Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// Add to favorites
router.post('/', verifyToken, async (req, res) => {
    try {
        const { movieId, title, posterPath } = req.body;
        const userId = req.user.id; // From token

        // Check if already exists
        const existing = await db.query(
            'SELECT * FROM favorites WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Movie already in favorites' });
        }

        const newFavorite = await db.query(
            'INSERT INTO favorites (user_id, movie_id, title, poster_path) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, movieId, title, posterPath]
        );

        res.json(newFavorite.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all favorites
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const favorites = await db.query(
            'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(favorites.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Remove from favorites
router.delete('/:movieId', verifyToken, async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user.id;

        await db.query(
            'DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId]
        );

        res.json({ message: 'Removed from favorites' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
