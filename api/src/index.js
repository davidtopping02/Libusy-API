const express = require("express");
const cors = require('cors');

const config = {
    name: 'uod-library-occupancy-api',
    port: 443,
    host: '0.0.0.0'
}

const app = express();

// Define allowed origins
const allowedOrigins = ['', 'https://www.uod.davidtopping.dev', 'http://localhost:4200'];

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
