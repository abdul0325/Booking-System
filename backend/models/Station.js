const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  city: { type: String, required: true },
  stationName: { type: String, required: true },
  stationId: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Station', stationSchema); 