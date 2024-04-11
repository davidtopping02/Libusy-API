const express = require("express");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
// const cors = require('cors');

const config = {
    name: 'uod-library-occupancy-api',
    port: 80,
    host: '0.0.0.0'
}

const app = express();

// Define allowed origins
// const allowedOrigins = ['', 'https://www.uod.davidtopping.dev', 'http://localhost:4200'];

// CORS middleware configuration
// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin) return callback(null, true); // Allow requests with no origin
//         if (allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     }
// }));

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
app.use("/api", defaultRouter);

const occupancyDataRouter = require("./routes/occupancy.route");
app.use("/api/occupancy", occupancyDataRouter);

// Swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Li-Busy REST API',
            version: '1.0.0',
            description: 'The University of Dundee Library Occupancy API provides access to real-time and historical occupancy data for various sections within the library. Developed using Node.js Express, this RESTful API interacts with a MySQL database to retrieve, add, and update occupancy records.',
        },
    },
    apis: ['./routes/*.js'],
};

// Initialize Swagger-jsdoc
const specs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Listening on the specified port
app.listen(config.port, config.host, (e) => {
    if (e) {
        throw new Error('Internal server error');
    }
    console.log(`${config.name} running on ${config.host}:${config.port}`);
});