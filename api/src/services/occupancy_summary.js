function generateLibraryOccupancy(hour) {
    if (hour < 8) { // 00:00 - 08:00
        return Math.round(10 + Math.random() * 5); // 10-15%
    } else if (hour < 10) { // 08:00 - 10:00
        return Math.round(10 + (hour - 8) * 20 + Math.random() * 10); // Gradual increase 10-50%
    } else if (hour < 12) { // 10:00 - 12:00
        return Math.round(50 + Math.random() * 30); // Peak 50-80%
    } else if (hour < 14) { // 12:00 - 14:00 (lunch dip)
        return Math.round(20 + Math.random() * 20); // 20-40%
    } else if (hour < 18) { // 14:00 - 18:00
        return Math.round(40 + Math.random() * 30); // 40-70%
    } else if (hour < 22) { // 18:00 - 22:00
        return Math.round(30 + (22 - hour) * 5 + Math.random() * 10); // Gradual decrease 30-50%
    } else { // 22:00 - 24:00
        return Math.round(10 + Math.random() * 5); // 10-15%
    }
}


function generateHourlyData(startDate) {
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
        const date = new Date(startDate.getTime() + hour * 60 * 60 * 1000);
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const time = `${hours}:${minutes}`;
        const occupancyPercentage = generateLibraryOccupancy(hour);
        hourlyData.push({ time, occupancy_percentage: occupancyPercentage });
    }
    return hourlyData;
}

function generateSectionData(sectionId, description, startDate) {
    const currentHour = new Date().getUTCHours();
    const sectionData = {
        section_id: sectionId,
        description: description,
        total_occupancy: 150, // Fixed total occupancy for simplicity
        current_occupancy_percentage: generateLibraryOccupancy(currentHour), // Dynamic current occupancy based on current hour
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
    startDate.setUTCHours(0, 0, 0, 0);
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
