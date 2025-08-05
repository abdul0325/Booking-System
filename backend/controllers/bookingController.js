const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  try {
    const { travelType, fromStation, toStation, date, time, seats } = req.body;

    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // Check for seat conflicts
    const existing = await Booking.find({
      fromStation,
      toStation,
      date,
      time,
      'seats.number': { $in: seats.map(s => s.number) }
    });
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Some seats are already booked for this time.' });
    }

    // Calculate total amount (simple example)
    const seatCount = seats.length;
    const price = travelType === 'business' ? 5500 : 4000;
    const totalAmount = seatCount * price;

    const booking = await Booking.create({
      user: user._id,
      username: user.username,
      travelType,
      fromStation,
      toStation,
      date,
      time,
      seats,
      totalAmount,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 
exports.calculateFare = async (req, res) => {
  try {
    const { fromStation, toStation, travelType } = req.query;
    
    // Basic validation
    if (!fromStation || !toStation || !travelType) {
      return res.status(400).json({ message: 'Missing required query parameters' });
    }

    const fare = travelType === 'business' ? 5500 : 4000;

    return res.json({ fare });
  } catch (err) {
    console.error('Error calculating fare:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
exports.getAvailableSeats = async (req, res) => {
  try {
    const { fromStation, toStation, date, time } = req.query;

    if (!fromStation || !toStation || !date || !time) {
      return res.status(400).json({ message: 'Missing required query parameters' });
    }

    // Get booked seats
    const bookings = await Booking.find({
      fromStation,
      toStation,
      date,
      time
    });

    const bookedSeatNumbers = bookings.flatMap(b => b.seats.map(s => s.number));

    // Assume bus has 40 seats (or however many)
    const allSeats = Array.from({ length: 40 }, (_, i) => i + 1);
    const availableSeats = allSeats.filter(seat => !bookedSeatNumbers.includes(seat));

    res.json({ availableSeats });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updtateStatus = async(req,res)=>{
  try {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({ message: 'Booking ID and status are required' });
    }

    const validStatuses = ['confirmed', 'cancelled', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });  
  }
}