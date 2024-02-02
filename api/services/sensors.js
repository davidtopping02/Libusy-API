const db = require('./db');
const helper = require('../helper');


async function getMultiple(page = 1) {
    const rows = await db.query(
        `SELECT * FROM sensor;`
    );
    const data = helper.emptyOrRows(rows);

    return {
        data,
    }
}

module.exports = {
    getMultiple
}