const db = require('./server/db');

async function checkFavorites() {
    try {
        const res = await db.query('SELECT * FROM favorites');
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkFavorites();
