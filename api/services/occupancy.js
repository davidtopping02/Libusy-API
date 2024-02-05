const db = require('./db');
const helper = require('../helper');

async function getOccupancyData() {

    const rows = await db.query(
        `SELECT 
            s.section_id, 
            s.description, 
            od.occupancy_count, 
            od.timestamp
        FROM 
            section s
            JOIN sensor se ON s.section_id = se.section_id
            JOIN occupancyData od ON se.sensor_id = od.sensor_id
            INNER JOIN (
                SELECT 
                    sensor_id, 
                    MAX(timestamp) AS latest_timestamp
                FROM 
                    occupancyData
                GROUP BY 
                    sensor_id
            ) AS latest ON od.sensor_id = latest.sensor_id AND od.timestamp = latest.latest_timestamp
        ORDER BY 
            s.section_id;`);

    const data = helper.emptyOrRows(rows);

    return {
        data
    };
}

async function getOccupancyDataBySection(section_id) {
    const rows = await db.query(
        `SELECT 
        s.section_id, 
        s.description, 
        od.occupancy_count, 
        od.timestamp
        FROM 
            section s
        JOIN 
            sensor se ON s.section_id = se.section_id
        JOIN 
            occupancyData od ON se.sensor_id = od.sensor_id
        INNER JOIN (
            SELECT 
                sensor_id, 
                MAX(timestamp) AS latest_timestamp
            FROM 
                occupancyData
            GROUP BY 
                sensor_id
        ) AS latest ON od.sensor_id = latest.sensor_id AND od.timestamp = latest.latest_timestamp
        WHERE 
            s.section_id = ?
        ORDER BY 
            s.section_id;`,
        [section_id]
    );
    const data = helper.emptyOrRows(rows);

    return {
        data,
    }
}

async function addOccupancyData(sensor_id, timestamp, occupancy_count) {
    const result = await db.query(
        `INSERT INTO occupancyData (sensor_id, timestamp, occupancy_count)
         VALUES (?, ?, ?);`,
        [sensor_id, timestamp, occupancy_count]
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