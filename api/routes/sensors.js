const express = require('express');
const router = express.Router();
const sensors = require('../services/sensors');

/* GET sensors */
router.get('/', async function (req, res, next) {
    try {
        res.json(await sensors.getMultiple(req.query.page));
    } catch (err) {
        console.error(`Error while getting sensors `, err.message);
        next(err);
    }
});

module.exports = router;