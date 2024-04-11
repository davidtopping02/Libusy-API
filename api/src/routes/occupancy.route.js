const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const helper = require('../helper');
const apiKeyAuthMiddleware = require('../services/apiKeyAuth');
const sensorData = require('../services/sensors');
const occupancyData = require('../services/occupancy');
const occupancySummary = require('../services/occupancy_summary');

/**
 * @swagger
 * components:
 *   schemas:
 *     OccupancyData:
 *       type: object
 *       properties:
 *         // Define properties of the OccupancyData schema here
 *     OccupancyDataInput:
 *       type: object
 *       properties:
 *         sensor_id:
 *           type: string
 *           description: The ID of the sensor.
 *         occupancy_count:
 *           type: integer
 *           description: The occupancy count.
 *     OccupancyPredictionsInput:
 *       type: object
 *       properties:
 *         section_id:
 *           type: integer
 *           description: The ID of the section.
 *         predictions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               // Define properties of the prediction object here
 */

/**
 * @swagger
 * /occupancy:
 *   get:
 *     summary: Get all occupancy data
 *     description: Retrieves all occupancy data from the database.
 *     responses:
 *       200:
 *         description: A list of occupancy data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OccupancyData'
 */
router.get('/', async (req, res, next) => {
    try {
        const data = await occupancySummary.getOccupancySummaryData();
        res.json(data);
    } catch (err) {
        console.error('Error while getting all occupancy data', err.message);
        next(err);
    }
});

/**
 * @swagger
 * /occupancy/sections/{sectionId}:
 *   get:
 *     summary: Get occupancy data for a specific section
 *     description: Retrieves occupancy data for a specific section identified by sectionId.
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the section to retrieve occupancy data for.
 *     responses:
 *       200:
 *         description: Occupancy data for the specified section.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OccupancyData'
 */
router.get('/sections/:sectionId', async (req, res, next) => {
    try {
        const sectionId = req.params.sectionId;
        const data = await occupancyData.getOccupancyDataBySection(sectionId);
        res.json(data);
    } catch (err) {
        console.error(`Error while getting occupancy data for section ${sectionId}`, err.message);
        next(err);
    }
});

/**
 * @swagger
 * /occupancy/sections/{sectionId}/time-period:
 *   get:
 *     summary: Get occupancy data for a specific section within a time period
 *     description: Retrieves occupancy data for a specific section within a specified time period.
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the section to retrieve occupancy data for.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date of the time period in YYYY-MM-DD format.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date of the time period in YYYY-MM-DD format.
 *     responses:
 *       200:
 *         description: Occupancy data for the specified section within the specified time period.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OccupancyData'
 */
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

/**
 * @swagger
 * /occupancy/add:
 *   post:
 *     summary: Add a new occupancy data record
 *     description: Adds a new occupancy data record to the database.
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OccupancyDataInput'
 *     responses:
 *       200:
 *         description: The newly added occupancy data record.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OccupancyData'
 *       400:
 *         description: Bad request. Invalid request body format or missing required fields.
 *       401:
 *         description: Unauthorized. API key is missing or invalid.
 */
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

/**
 * @swagger
 * /occupancy/predictions/add:
 *   post:
 *     summary: Add occupancy predictions
 *     description: Adds occupancy predictions for a specific section to the database.
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OccupancyPredictionsInput'
 *     responses:
 *       200:
 *         description: Predictions added successfully.
 *       400:
 *         description: Bad request. Invalid request body format or missing required fields.
 *       401:
 *         description: Unauthorized. API key is missing or invalid.
 */
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
