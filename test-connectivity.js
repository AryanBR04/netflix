const axios = require('axios');

async function testConnection() {
    try {
        console.log("Testing connection to TMDB...");
        const response = await axios.get('https://api.themoviedb.org/3/configuration');
        console.log("Success! Status:", response.status);
    } catch (error) {
        console.error("Connection Failed:", error.message);
        if (error.code) console.error("Error Code:", error.code);
    }
}

testConnection();
