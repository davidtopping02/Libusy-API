const db = require('./db');
const helper = require('../helper');

async function getOccupancySummaryData() {
    try {
        const sections = await fetchSectionsData();
        const responseData = await prepareResponseData(sections);
        return responseData;
    } catch (error) {
        throw error;
    }
}

async function fetchSectionsData() {
    try {
        const sections = await db.query(`
            SELECT 
                section_id, description, total_occupancy, 
                ROUND(occupancy_percentage) AS current_occupancy_percentage 
            FROM uodLibraryOccupancy.section;
        `);
        return helper.emptyOrRows(sections);
    } catch (error) {
        throw error;
    }
}

async function prepareResponseData(sectionsData) {
    try {
        const responseData = { data: [] };
        const fetchTime = new Date().toISOString();

        for (const section of sectionsData) {
            const hoursData = await fetchHourlyData(section);
            responseData.data.push({
                section_id: section.section_id,
                description: section.description,
                hours: hoursData
            });
        }

        responseData.fetch_time = fetchTime;
        return responseData;
    } catch (error) {
        throw error;
    }
}

async function fetchHourlyData(section) {
    try {
        const hoursData = [];
        let pastOccupancy, predictiveOccupancy;

        if (section.section_id !== 1) {
            pastOccupancy = await fetchPastOccupancy(section);
            predictiveOccupancy = await fetchPredictiveOccupancy(section);
        }

        const currentOccupancy = getCurrentHourOccupancy(section);

        if (pastOccupancy) {
            hoursData.push(...pastOccupancy);
        }

        hoursData.push(currentOccupancy);

        if (predictiveOccupancy) {
            hoursData.push(...predictiveOccupancy);
        }

        return hoursData;
    } catch (error) {
        throw error;
    }
}

async function fetchPastOccupancy(section) {
    try {
        const pastOccupancy = await db.query(`
            SELECT 
                DATE_FORMAT(DATE_SUB(date, INTERVAL 0 HOUR), '%H:00') AS hour, 
                ROUND((average_occupancy_count / ? * 100)) AS occupancy_percentage
            FROM uodLibraryOccupancy.occupancySummary
            WHERE section_id = ? 
                AND date >= DATE_SUB(NOW(), INTERVAL 3 HOUR)
                AND date < DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ORDER BY date ASC;
        `, [section.total_occupancy, section.section_id]);
        return pastOccupancy.map(item => ({
            time: item.hour,
            occupancy_percentage: parseFloat(item.occupancy_percentage.toFixed(2))
        }));
    } catch (error) {
        throw error;
    }
}

function getCurrentHourOccupancy(section) {
    const currentHour = new Date();
    const currentHourFormatted = `${currentHour.getHours()}:00`;
    return {
        time: currentHourFormatted,
        occupancy_percentage: section.current_occupancy_percentage
    };
}

async function fetchPredictiveOccupancy(section) {
    try {
        const predictiveOccupancy = await db.query(`
            SELECT 
                DATE_FORMAT(prediction_time, '%H:00') AS hour, 
                ROUND((predicted_occupancy / ? * 100)) AS occupancy_percentage
            FROM uodLibraryOccupancy.occupancyPrediction
            WHERE section_id = ? 
                AND prediction_time >= NOW() + INTERVAL 0 HOUR
                AND prediction_time <= NOW() + INTERVAL 9 HOUR
            ORDER BY prediction_time ASC;
        `, [section.total_occupancy, section.section_id]);
        return predictiveOccupancy.map(item => ({
            time: item.hour,
            occupancy_percentage: parseFloat(item.occupancy_percentage.toFixed(2))
        }));
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getOccupancySummaryData
};
