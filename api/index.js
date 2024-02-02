const express = require("express");
const app = express();
const port = 3000;


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
app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
});
