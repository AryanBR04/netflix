const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            "INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, phone, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: "Email already registered" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user exists
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/auth/protected — test route
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({
        message: 'Access granted to protected route',
        userId: req.userId,
    });
});

module.exports = router;
