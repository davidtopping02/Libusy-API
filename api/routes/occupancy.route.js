const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const helper = require('../helper');


const occupancyData = require('../services/occupancy');

/* GET occupancyData */
router.get('/',

    [query('sectionId').optional().isNumeric().withMessage('sectionId must be a number')],
    helper.validate,

    async function (req, res, next) {
        try {

            const sectionId = req.query.sectionId;
            let data;

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
