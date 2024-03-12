const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const helper = require('../helper');
const apiKeyAuthMiddleware = require('../services/apiKeyAuth');
const sensorData = require('../services/sensors');

const occupancyData = require('../services/occupancy');
const occupancySummary = require('../services/occupancy_summary');



// Route for getting all occupancy data
router.get('/', async (req, res, next) => {

    try {
        const data = await occupancySummary.getOccupancySummaryData();
        res.json(data);
    } catch (err) {
        console.error('Error while getting all occupancy data', err.message);
        next(err);
    }
});

// Route for getting current occupancy data for a specific sectionId
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

// Route for getting occupancy data for a specific section within a time period with validation
router.get('/sections/:sectionId/time-period', [
    query('startDate').isISO8601().withMessage('startDate must be a valid date in YYYY-MM-DD format'),
    query('endDate').isISO8601().withMessage('endDate must be a valid date in YYYY-MM-DD format'),
    query('endDate').custom((value, { req }) => {
        if (new Date(value) < new Date(req.query.startDate)) {
            throw new Error('endDate must be after startDate');
        }
        return true;
    }),
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { sectionId } = req.params;
        const { startDate, endDate } = req.query;

        const data = await occupancyData.getOccupancyDataBySectionAndTimePeriod(sectionId, startDate, endDate);
        res.json(data);
    } catch (err) {
        console.error(`Error while getting occupancy data for section ${req.params.sectionId} within the specified time period`, err.message);
        next(err);
    }
});

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


// Route adding a new occupancyData record
router.post('/predictions/add',
    apiKeyAuthMiddleware,
    [
        body('section_id').notEmpty().withMessage('section_id is required').isInt().withMessage('section_id must be an integer'),
        body('predictions').isArray().withMessage('predictions must be an array').notEmpty().withMessage('predictions array cannot be empty')
    ], helper.validate, async (req, res, next) => {

        try {
            const { section_id, predictions } = req.body;

            const result = await occupancyData.updateOccupancyPredictions(section_id, predictions);

            if (result.success) {
                res.status(200).json({ message: 'Predictions added successfully.' });
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (err) {
            console.error(`Error while adding predictions`, err.message);
            next(err);
        }
    });

module.exports = router;


module.exports = router;

