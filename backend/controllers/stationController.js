const Station = require('../models/Station');

exports.getStations = async (req, res) => {
  try {
    const stations = await Station.find().sort({ city: 1, stationName: 1 });
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createStation = async (req, res) => {
  try {
    const { city, stationName, stationId } = req.body;
    if (!city || !stationName || !stationId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const exists = await Station.findOne({ stationId });
    if (exists) {
      return res.status(400).json({ message: 'Station ID already exists' });
    }
    const station = await Station.create({ city, stationName, stationId });
    res.status(201).json(station);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateStation = async (req, res) => {
  try {
    const { id } = req.params;
    const { city, stationName, stationId } = req.body;
    const station = await Station.findByIdAndUpdate(
      id,
      { city, stationName, stationId },
      { new: true, runValidators: true }
    );
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteStation = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await Station.findByIdAndDelete(id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json({ message: 'Station deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 