const express = require("express");
const { log, ExpressAPILogMiddleware } = require('@rama41222/node-logger');

const config = {
    name: 'uod-library-occupancy-api',
    port: 3000,
    host: '10.8.0.1'
}

const app = express();
const logger = log({ console: true, file: false, label: config.name });


// middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

/* Import and use router modules */
const defaultRouter = require("./routes/index.route");
app.use("/", defaultRouter);

const sensorsRouter = require("./routes/sensors.route");
app.use("/sensors", sensorsRouter);

const occupancyDataRouter = require("./routes/occupancy.route");
app.use("/occupancy", occupancyDataRouter);

// Listening on the specified port
app.listen(config.port, config.host, (e) => {
    if (e) {
        throw new Error('Internal server error')
    }
    logger.info(`${config.name} running on ${config.host}:${config.port}`);
});
