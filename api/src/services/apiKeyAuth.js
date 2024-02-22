const db = require('./db');
const helper = require('../helper');


const apiKeyAuthMiddleware = async (req, res, next) => {
    const apiKey = req.get('X-API-Key');
    if (!apiKey) {
        return res.status(401).json({ message: 'API key is missing' });
    }

    try {
        // const [rows] = await db.query('SELECT * FROM sensor WHERE api_key = ?', [apiKey]);

        const rows = await db.query('SELECT * FROM sensor WHERE api_key = ?', [apiKey])
        const data = helper.emptyOrRows(rows);

        if (data.length === 0) {
            return res.status(403).json({ message: 'Invalid API key' });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = apiKeyAuthMiddleware;
