const db = require('./db');
const helper = require('../helper');


async function getSensors() {
    const rows = await db.query(
        `SELECT * FROM sensor;`
    );
    const data = helper.emptyOrRows(rows);

    return {
        data,
    }
}

async function doesSensorExist(sensor_id) {
    const rows = await db.query(
        `SELECT COUNT(sensor_id) as sensor_id_count FROM sensor
        WHERE sensor_id = ?;`,
        [sensor_id]
    );

    const result = rows[0];
    const sensor_id_count = result.sensor_id_count;

    // Return true if sensor_id_count is greater than 0
    return sensor_id_count > 0;
}

module.exports = {
    getSensors,
    doesSensorExist
}