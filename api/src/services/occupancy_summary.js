const db = require('./db');
const helper = require('../helper');


function generateHourlyData(startDate) {
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
        const time = new Date(startDate.getTime() + hour * 60 * 60 * 1000).toISOString();
        const occupancyPercentage = Math.floor(Math.random() * 61) + 40; // Random occupancy between 40% and 100%
        hourlyData.push({ time, occupancy_percentage: occupancyPercentage });
    }
    return hourlyData;
}

function generateSectionData(sectionId, description, startDate) {
    const sectionData = {
        section_id: sectionId,
        description: description,
        total_occupancy: Math.floor(Math.random() * 101) + 100, // Random total occupancy between 100 and 200
        current_occupancy_percentage: Math.floor(Math.random() * 61) + 40, // Random current occupancy percentage between 40% and 100%
        occupancy: []
    };
    
    for (let day = 0; day < 7; day++) {
        const dailyDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
        sectionData.occupancy.push(generateHourlyData(dailyDate));
    }
    
    return sectionData;
}

function generateOccupancyState() {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const data = [];
    
    const sections = [
        { id: 1, description: "Section A" },
        { id: 2, description: "Section B" },
        { id: 3, description: "Section C" },
        { id: 4, description: "Section D" },
        { id: 5, description: "Section E" }
    ];
    
    for (const section of sections) {
        data.push(generateSectionData(section.id, section.description, startDate));
    }
    
    const occupancyState = {
        data,
        fetch_time: new Date().toISOString(),
        error: null,
        status: "success"
    };
    
    return occupancyState;
}

async function getOccupancySummaryData() {
    try {
        const responseData = generateOccupancyState();
        return responseData;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = { getOccupancySummaryData };



module.exports = {
    getOccupancySummaryData
};
