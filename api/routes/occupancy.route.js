const express = require('express');
const router = express.Router();
const { body } = require('express-validator'); // Ensure this is correctly imported
const helper = require('../helper');
const occupancyData = require('../services/occupancy');
const sensorData = require('../services/sensors');

// Route for getting all occupancy data
router.get('/', async (req, res, next) => {

    try {
        const data = await occupancyData.getOccupancyData();
        res.json(data);
    } catch (err) {
        console.error('Error while getting all occupancy data', err.message);
        next(err);
    }
});

// Route for getting occupancy data for a specific sectionId
router.get('/sections/:sectionId',

    async (req, res, next) => {
        try {
            const sectionId = req.params.sectionId;
            const data = await occupancyData.getOccupancyDataBySection(sectionId);
            res.json(data);
        } catch (err) {
            console.error(`Error while getting occupancy data for section ${sectionId}`, err.message);
            next(err);
        }
    }
);

// Route adding a new occupancyData record
router.post('/add', [
    body('sensor_id').notEmpty().withMessage('sensor_id is required').custom(async (value, { req }) => {
        const exists = await sensorData.doesSensorExist(value);
        if (!exists) {
            throw new Error('Sensor not found');
        }
        return true; // Validation passed if the sensor exists
    }),
    body('timestamp').isISO8601().withMessage('timestamp must be a valid ISO8601 date'),
    body('occupancy_count').isInt().withMessage('occupancy_count must be an integer'),
], helper.validate, async (req, res, next) => {

    try {
        const { sensor_id, timestamp, occupancy_count } = req.body;
        const data = await occupancyData.addOccupancyData(sensor_id, timestamp, occupancy_count)
        res.json(data);
    } catch (err) {
        console.error(`Error while adding occupancy data`, err.message);
        next(err);
    }

    // return res.status(200).json({ message: 'Occupancy data successfully inserted.' });

});

module.exports = router;
