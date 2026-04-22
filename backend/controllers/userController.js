const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const normalizedUsername = String(username).trim();
    if (normalizedUsername.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = new User({
      username: normalizedUsername,
      password: String(password),
      role: isAdmin ? 'admin' : 'user',
    });

    await user.save();

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const normalizedUsername = String(username).trim();
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    return res.status(200).json({
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('username role createdAt');
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
