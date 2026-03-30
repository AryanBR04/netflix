const express = require('express');
const router = express.Router();

router.get('/*', async (req, res) => {
    try {
        const apiKey = process.env.TMDB_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }

        // The exact path after /api/tmdb
        const path = req.params[0];
        
        // Build the TMDB URL
        const tmdbUrl = new URL(`https://api.themoviedb.org/3/${path}`);
        
        // Append all original query params (e.g., language, with_genres)
        for (const [key, value] of Object.entries(req.query)) {
            tmdbUrl.searchParams.append(key, value);
        }
        
        // Append the API key
        tmdbUrl.searchParams.append('api_key', apiKey);

        // Fetch using native Node fetch (Node 18+)
        const response = await fetch(tmdbUrl.toString());
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('TMDB Proxy Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from TMDB' });
    }
});

module.exports = router;
