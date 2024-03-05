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

async function getOccupancySummaryData() {
    // Fetch sections data including the current occupancy percentage
    const sections = await db.query(`
        SELECT 
            section_id, description, total_occupancy, 
            ROUND(occupancy_percentage) AS current_occupancy_percentage 
        FROM uodLibraryOccupancy.section;
    `);
    const sectionsData = helper.emptyOrRows(sections);

    // Prepare the response data structure
    let responseData = { data: [] };

    // Record the fetch time
    const fetchTime = new Date().toISOString();

    for (const section of sectionsData) {
        let hoursData = [];

        // Fetch past occupancy data for the last 2 hours excluding the current hour
        const pastOccupancy = await db.query(`
            SELECT 
                DATE_FORMAT(DATE_SUB(date, INTERVAL 0 HOUR), '%H:00') AS hour, 
                ROUND((average_occupancy_count / ? * 100)) AS occupancy_percentage
            FROM uodLibraryOccupancy.occupancySummary
            WHERE section_id = ? 
                AND date >= DATE_SUB(NOW(), INTERVAL 3 HOUR) -- Adjusted interval to go 2 hours back
                AND date < DATE_SUB(NOW(), INTERVAL 1 HOUR)  -- Adjusted interval to end 1 hour ago
            ORDER BY date ASC;
        `, [section.total_occupancy, section.section_id]);

        // Append past occupancy data
        hoursData.push(...pastOccupancy.map(item => ({
            time: item.hour,
            occupancy_percentage: parseFloat(item.occupancy_percentage.toFixed(2))
        })));

        // Fetch and append current hour occupancy percentage directly from the section table
        const currentHour = new Date();
        const currentHourFormatted = `${currentHour.getHours()}:00`; // Format might need adjustment
        hoursData.push({
            time: currentHourFormatted,
            occupancy_percentage: section.current_occupancy_percentage
        });

        // Fetch predictive occupancy data for the next 9 hours based on the current hour
        const predictiveOccupancy = await db.query(`
            SELECT 
                DATE_FORMAT(prediction_datetime, '%H:00') AS hour, 
                ROUND((predicted_occupancy / ? * 100)) AS occupancy_percentage
            FROM uodLibraryOccupancy.occupancyPrediction
            WHERE section_id = ? 
                AND prediction_datetime >= NOW()
                AND prediction_datetime <= DATE_ADD(NOW(), INTERVAL 9 HOUR)
            ORDER BY prediction_datetime ASC;
        `, [section.total_occupancy, section.section_id]);

        // Append predictive data
        hoursData.push(...predictiveOccupancy.map(item => ({
            time: item.hour,
            occupancy_percentage: parseFloat(item.occupancy_percentage.toFixed(2))
        })));

        // Construct the section data object
        responseData.data.push({
            section_id: section.section_id,
            description: section.description,
            hours: hoursData
        });
    }

    // Include fetch time in the response
    responseData.fetch_time = fetchTime;

    return responseData;
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
    getOccupancySummaryData,
    getOccupancyDataBySectionAndTimePeriod,
    updateOccupancyPredictions
}