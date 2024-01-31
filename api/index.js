const express = require("express");
const app = express();
const port = 3000;

// router modules
const sensorssRouter = require("./routes/sensors");

// middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route for the root path "/"
app.get("/", (req, res) => {
    res.json({ message: "welcome to the UoD Library Occupancy API" });
});

// Using the "sensorssRouter" for routes starting with "/sensors"
app.use("/sensors", sensorssRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500; // Default status code is 500
    console.error(err.message, err.stack); // Logging the error details
    res.status(statusCode).json({ message: err.message }); // Sending an error response
    return;
});

// Listening on the specified port
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
