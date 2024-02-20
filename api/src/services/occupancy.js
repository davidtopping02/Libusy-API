const db = require('./db');
const helper = require('../helper');

async function getOccupancyData() {

    const rows = await db.query(
        `SELECT * FROM uodLibraryOccupancy.section;`);

    const data = helper.emptyOrRows(rows);

    return {
        data
    };
}

async function getOccupancyDataBySection(section_id) {
    const rows = await db.query(
        `SELECT * FROM uodLibraryOccupancy.section
        WHERE section_id = ?;`,
        [section_id]
    );
    const data = helper.emptyOrRows(rows);

    return {
        data,
    }
}

async function addOccupancyData(sensor_id, occupancy_count) {
    const result = await db.query(
        `INSERT INTO occupancyReading (sensor_id, occupancy_count)
         VALUES (?, ?);`,
        [sensor_id, occupancy_count]
    );

    let message = { Error: "Error adding occupancy data" }

    if (result.affectedRows) {
        message = { Success: "Succesfuly added occupancy data" }
    }

    return message;
}

module.exports = {
    getOccupancyData,
    getOccupancyDataBySection,
    addOccupancyData
}