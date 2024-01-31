const express = require('express');
const router = express.Router();

const occupancyData = require('../services/occupancy');

/* GET occupancyData */
router.get('/section', async function (req, res, next) {
    try {
        const sectionId = req.query.id;
        if (!sectionId) {
            data = await occupancyData.getOccupancyData();
        } else {
            data = await occupancyData.getOccupancyDataBySection(sectionId);
        }
        res.json(data);

    } catch (err) {
        console.error(`Error while getting occupancy data for section ${sectionId}`, err.message);
        next(err);
    }
});

module.exports = router;