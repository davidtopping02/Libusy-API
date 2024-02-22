const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const helper = require('../helper');
const occupancyData = require('../services/occupancy');
const apiKeyAuthMiddleware = require('../services/apiKeyAuth');
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
router.post('/add',
    apiKeyAuthMiddleware,
    [
        body('sensor_id').notEmpty().withMessage('sensor_id is required').custom(async (value, { req }) => {
            const exists = await sensorData.doesSensorExist(value);
            if (!exists) {
                throw new Error('Sensor not found');
            }
            return true; // Validation passed if the sensor exists
        }),
        body('occupancy_count').isInt().withMessage('occupancy_count must be an integer'),
    ], helper.validate, async (req, res, next) => {

        try {
            const { sensor_id, occupancy_count } = req.body;
            const data = await occupancyData.addOccupancyData(sensor_id, occupancy_count)
            res.json(data);
        } catch (err) {
            console.error(`Error while adding occupancy data`, err.message);
            next(err);
        }

    });

module.exports = router;
