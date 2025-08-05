"use strict";

var express = require("express");

var mongoose = require("mongoose");

var cors = require("cors");

var dotenv = require("dotenv");

dotenv.config();
var app = express();
app.use(cors());
app.use(express.json()); // Import routes

var userRoutes = require("./routes/userRoutes");

var stationRoutes = require("./routes/stationRoutes");

var bookingRoutes = require("./routes/bookingRoutes");

app.use("/api/users", userRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/bookings", bookingRoutes);
var PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(function () {
  return console.log("✅ MongoDB connected");
})["catch"](function (err) {
  return console.error("❌ MongoDB connection error:", err);
});
app.listen(PORT, function () {
  return console.log("Server running on port ".concat(PORT));
});