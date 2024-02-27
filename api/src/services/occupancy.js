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
    const sections = await db.query(`SELECT section_id, description, total_occupancy, ROUND(occupancy_percentage) AS current_occupancy_percentage FROM uodLibraryOccupancy.section;`);
    const sectionsData = helper.emptyOrRows(sections);

    // Prepare the response data structure
    let responseData = { data: [] };

    // Record the fetch time
    const fetchTime = new Date().toISOString();

    for (const section of sectionsData) {

        let hoursData = [];

        if (section.section_id !== 1) {
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
        }


        // Fetch and append current hour occupancy percentage directly from the section table
        const currentHour = new Date();
        const currentHourFormatted = `${currentHour.getHours()}:00`; // Format might need adjustment
        hoursData.push({
            time: currentHourFormatted,
            occupancy_percentage: section.current_occupancy_percentage
        });

        // For section_id 1, we only need the current hour's occupancy, so skip fetching past and predictive occupancy
        if (section.section_id === 1) {
            // Construct the section data object
            responseData.data.push({
                section_id: section.section_id,
                description: section.description,
                hours: hoursData
            });
            continue; // Skip the rest of the loop for this section
        }

        // Fetch predictive occupancy data for the next 9 hours based on the same hour a week ago
        const predictiveOccupancy = await db.query(`
        SELECT 
            DATE_FORMAT(DATE_ADD(date, INTERVAL 1 WEEK), '%H:00') AS hour, 
            ROUND((average_occupancy_count / ? * 100)) AS occupancy_percentage
        FROM uodLibraryOccupancy.occupancySummary
        WHERE section_id = ? AND 
          date > DATE_ADD(NOW(), INTERVAL 0 HOUR) - INTERVAL 1 WEEK AND 
          date <= DATE_ADD(NOW(), INTERVAL 9 HOUR) - INTERVAL 1 WEEK
        ORDER BY date ASC;
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



module.exports = {
    getOccupancyData,
    getOccupancyDataBySection,
    addOccupancyData,
    getOccupancySummaryData
}