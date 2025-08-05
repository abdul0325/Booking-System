const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  travelType: { type: String, enum: ['business', 'economy'], required: true },
  fromStation: { type: String, required: true },
  toStation: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  seats: [{ number: Number }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema); 