const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'station_master', 'admin'], default: 'user' },

  // 🔹 New Fields
  status: {
    type: String,
    enum: ['pending', 'active'],
    default: function () {
      return this.role === 'station_master' ? 'pending' : 'active';
    },
  },
  assignedStation: {
    stationId: String,
    stationName: String
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
