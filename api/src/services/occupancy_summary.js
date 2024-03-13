const db = require('./db');
const helper = require('../helper');

async function getOccupancySummaryData() {
    try {
        const sections = await fetchSectionsData();
        const responseData = await prepareResponseData(sections);
        return responseData;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function fetchSectionsData() {
    const sections = await db.query(`
        SELECT 
            section_id, description, total_occupancy, 
            ROUND(occupancy_percentage) AS current_occupancy_percentage 
        FROM uodLibraryOccupancy.section;
    `);
    return helper.emptyOrRows(sections);
}

async function prepareResponseData(sectionsData) {

    const responseData = { data: [], fetch_time: new Date().toISOString() };

    for (const section of sectionsData) {
        let summary;

        if (section.section_id !== 1) {
            summary = await fetchWeeklyData(section);
        }
        if (summary !== undefined) {
            responseData.data.push({ ...section, occupancy: summary });
        } else {
            responseData.data.push({ ...section });
        }
    }
    return responseData;
}

function calculateLastOccurrenceDate(day) {
    const today = new Date();
    const todayDayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
    const daysToLastOccurrence = todayDayOfWeek >= day ? todayDayOfWeek - day : 7 - (day - todayDayOfWeek);

    today.setDate(today.getDate() - daysToLastOccurrence);
    return today;
}

async function fetchLastWeekSameDayData(section, date) {
    try {
        const formattedDate = date.toISOString().split('T')[0]; // Format date to 'YYYY-MM-DD'

        const query = `
            SELECT 
                HOUR(date) AS hour, 
                ROUND((average_occupancy_count / total_occupancy * 100), 2) AS occupancy_percentage
            FROM occupancySummary
            INNER JOIN section ON occupancySummary.section_id = section.section_id
            WHERE occupancySummary.section_id = ?
            AND DATE(date) = ?
            ORDER BY date ASC;
        `;

        const results = await db.query(query, [section.section_id, formattedDate]);

        return results.map(item => ({
            time: `${item.hour}:00`,
            occupancy_percentage: parseInt(item.occupancy_percentage, 10)
        }));
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function fetchWeeklyData(section) {
    const promises = Array.from({ length: 7 }, (_, day) => fetchDailyData(day, section));
    return Promise.all(promises);
}

async function fetchDailyData(day, section) {
    if (day === getCurrentDayOfWeek()) {
        return await getCurrentDayData(section);
    } else {
        const lastOccurrenceDate = calculateLastOccurrenceDate(day);
        return await fetchLastWeekSameDayData(section, lastOccurrenceDate);
    }
}

async function getCurrentDayData(section) {
    const [pastOccupancy, predictiveOccupancy] = await Promise.all([
        fetchPastOccupancy(section),
        fetchPredictiveOccupancy(section)
    ]);
    const currentOccupancy = getCurrentHourOccupancy(section);
    return [...(pastOccupancy || []), currentOccupancy, ...(predictiveOccupancy || [])];
}

async function fetchPastOccupancy(section) {
    const pastOccupancy = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%H:00') AS hour, 
        ROUND((average_occupancy_count / ? * 100)) AS occupancy_percentage
      FROM 
        uodLibraryOccupancy.occupancySummary
      WHERE 
        section_id = ? 
        AND date >= CURDATE() 
        AND date < NOW()
      ORDER BY 
        date ASC;
    `, [section.total_occupancy, section.section_id]);
    
    return pastOccupancy.map(item => ({
      time: item.hour,
      occupancy_percentage: parseFloat(item.occupancy_percentage.toFixed(2))
    }));
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
    const predictiveOccupancy = await db.query(`
        SELECT 
            DATE_FORMAT(prediction_time, '%H:00') AS hour, 
            ROUND((predicted_occupancy / ? * 100)) AS occupancy_percentage
        FROM 
            uodLibraryOccupancy.occupancyPrediction
        WHERE 
            section_id = ? 
            AND prediction_time >= NOW()
            AND prediction_time < CURDATE() + INTERVAL 1 DAY 
        ORDER BY 
            prediction_time ASC;
    `, [section.total_occupancy, section.section_id]);
    return predictiveOccupancy.map(item => ({
        time: item.hour,
        occupancy_percentage: parseFloat(item.occupancy_percentage.toFixed(2))
    }));
}


function getCurrentDayOfWeek() {
    return new Date().getDay();
}

module.exports = {
    getOccupancySummaryData
};
