const axios = require('axios');

async function testConnection() {
    try {
        console.log("Testing connection to TMDB...");
        const response = await axios.get('https://api.themoviedb.org/3/configuration?api_key=' + process.env.TMDB_API_KEY);
        // Note: process.env might not be loaded here without dotenv, but we just want "connectivity" check.
        // Actually without API key it might 401, but that PROVES connectivity.
        // 500/Timeout proves blockage.
        // Let's just hit google or something if we want internet check? No, specifically TMDB block.
        // hitting with no key -> 401 Unauthorized -> Success (Connection worked).
        // hitting and timeout -> Blocked.
        const res = await axios.get('https://api.themoviedb.org/3/configuration');
        console.log("Success! Status:", res.status);
    } catch (error) {
        if (error.response) {
            console.log("Connected! API responded with status:", error.response.status);
        } else {
            console.error("Connection Failed:", error.message);
            if (error.code) console.error("Error Code:", error.code);
        }
    }
}

testConnection();
