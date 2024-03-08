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



async function getOccupancyDataBySectionAndTimePeriod(sectionId, startDate, endDate) {
    if (!startDate || !endDate || !sectionId) {
        return { error: 'startDate, endDate, and sectionId are required and must be valid.' };
    }

    // Query to select occupancy summary data for a specific section within a specified date range
    const query = `
        SELECT date, average_occupancy_count
        FROM uodLibraryOccupancy.occupancySummary
        WHERE section_id = ?
        AND date BETWEEN ? AND ?
        ORDER BY date ASC;
    `;

    const rows = await db.query(query, [sectionId, startDate, endDate]);

    // Utilize the helper function to check for empty results and format the response
    const occupancyData = helper.emptyOrRows(rows);

    // Transform the data to include section_id once and nest the occupancy data
    const transformedData = {
        section_id: sectionId,
        occupancy_data: occupancyData
    };

    return transformedData;
}

async function updateOccupancyPredictions(sectionId, predictions) {
    const queryPromises = predictions.map(async prediction => {
        const { prediction_time, predicted_occupancy } = prediction;
        const query = `
            INSERT INTO occupancyPrediction (section_id, prediction_time, predicted_occupancy)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE predicted_occupancy = ?;
        `;
        const values = [sectionId, prediction_time, predicted_occupancy, predicted_occupancy];
        try {
            await db.query(query, values);
            console.log(`Occupancy prediction updated for Section ${sectionId} at ${prediction_time}.`);
            return true;
        } catch (error) {
            console.error(`Error updating occupancy prediction for Section ${sectionId} at ${prediction_time}:`, error);
            return false;
        }
    });

    try {
        const results = await Promise.all(queryPromises);
        if (results.every(result => result)) {
            console.log('All occupancy predictions updated successfully.');
            return { success: true };
        } else {
            console.error('Some occupancy predictions failed to update.');
            return { success: false, error: 'Some occupancy predictions failed to update.' };
        }
    } catch (error) {
        console.error('Error updating occupancy predictions:', error);
        return { success: false, error: 'Failed to update occupancy predictions.' };
    }
}





module.exports = {
    getOccupancyData,
    getOccupancyDataBySection,
    addOccupancyData,
    getOccupancyDataBySectionAndTimePeriod,
    updateOccupancyPredictions
}