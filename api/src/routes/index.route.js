const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     description: Returns a welcome message for the UoD Library Occupancy API.
 *     responses:
 *       200:
 *         description: A welcome message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Welcome message.
 *                   example: "welcome to the UoD Library Occupancy API"
 */
router.get('/', async function (req, res, next) {
    res.json({ message: "welcome to the UoD Library Occupancy API! Documentation can be found at /docs" });
});

module.exports = router;
