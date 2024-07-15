function generateBellCurveOccupancy(hour) {
    const mean = 12; // peak at midday
    const variance = 16; // spread of the curve
    const exponent = -Math.pow(hour - mean, 2) / (2 * variance);
    const occupancyPercentage = Math.round(100 * Math.exp(exponent));
    return occupancyPercentage;
}

function generateHourlyData(startDate, currentHour) {
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
        const date = new Date(startDate.getTime() + hour * 60 * 60 * 1000);
        const time = date.toISOString().split('T')[0] + 'T' + date.toTimeString().slice(0, 5) + ':00Z';
        const occupancyPercentage = generateBellCurveOccupancy(hour);
        hourlyData.push({ time, occupancy_percentage: occupancyPercentage });
    }
    return hourlyData;
}

function generateSectionData(sectionId, description, startDate) {
    const currentHour = new Date().getHours();
    const sectionData = {
        section_id: sectionId,
        description: description,
        total_occupancy: 150, // Fixed total occupancy for simplicity
        current_occupancy_percentage: generateBellCurveOccupancy(currentHour), // Dynamic current occupancy based on current hour
        occupancy: []
    };
    
    for (let day = 0; day < 7; day++) {
        const dailyDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
        sectionData.occupancy.push(generateHourlyData(dailyDate, currentHour));
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
