const express = require("express");
const { log, ExpressAPILogMiddleware } = require('@rama41222/node-logger');

const config = {
    name: 'uod-library-occupancy-api',
    port: 80,
    host: '0.0.0.0'
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

const occupancyDataRouter = require("./routes/occupancy.route");
app.use("/occupancy", occupancyDataRouter);

// Listening on the specified port
app.listen(config.port, config.host, (e) => {
    if (e) {
        throw new Error('Internal server error')
    }
    console.log(`${config.name} running on ${config.host}:${config.port}`);
});
