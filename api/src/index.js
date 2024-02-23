const express = require("express");
const cors = require('cors'); // Include the cors package
const { log, ExpressAPILogMiddleware } = require('@rama41222/node-logger');

const config = {
    name: 'uod-library-occupancy-api',
    port: 80,
    host: '0.0.0.0'
}

const app = express();
const logger = log({ console: true, file: false, label: config.name });

// Define allowed origins
const allowedOrigins = ['http://192.168.56.1:4200', 'http://10.8.0.2:4200', 'https://www.uod.davidtopping.dev'];

// CORS middleware configuration
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Allow requests with no origin
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

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
        throw new Error('Internal server error');
    }
    console.log(`${config.name} running on ${config.host}:${config.port}`);
});
