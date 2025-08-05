const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role,status:user.status  }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user profile (protected)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 
exports.getAllUsers=async(req,res)=>{
  try {
    const users = await User.find().select('-password');
    res.json(users);
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    
  }
}
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from URL params instead of body
    const { status, assignedStation } = req.body;
    
    console.log('Received request to update user:',assignedStation);
    console.log('Update data:', { status, assignedStation });
    
    if (!id || !status) {
      return res.status(400).json({ message: 'User ID and status are required' });
    }

    // Prepare update data
    const updateData = { status };
    
    // If assigning a station (when approving), add station details
    if (status === 'approved' && assignedStation) {
      updateData.assignedStation = assignedStation;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully:', user);
    res.json({ 
      message: 'User status updated successfully', 
      user 
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      message: 'Error updating user status', 
      error: error.message 
    });
  }
};