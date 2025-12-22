const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');

// Basic endpoint for listing all farmers
// NOTE: This is not secured with auth yet; only use for development/testing.
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-password');
    res.json({ farmers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a farmer/user
router.delete('/farmers/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a farmer/user
router.put('/farmers/:id', async (req, res) => {
  try {
    const { name, email, phone, role, village, district } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (village) user.village = village;
    if (district) user.district = district;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

