const express = require('express');
const User = require('../models/User');
const adminCredentials = require('../config/adminCredentials');
const router = express.Router();

async function getOrRepairRequestedAdmin(username, password) {
  const normalizedUsername = String(username).trim().toLowerCase();
  const validUsernames = [adminCredentials.username.toLowerCase(), ...adminCredentials.legacyUsernames.map((u) => u.toLowerCase())];
  if (!validUsernames.includes(normalizedUsername) || password !== adminCredentials.password) {
    return null;
  }

  const user = await User.findOne({
    username: { $in: [adminCredentials.username, ...adminCredentials.legacyUsernames] },
  });

  if (user) {
    user.username = adminCredentials.username;
    user.password = adminCredentials.password;
    user.role = user.role || 'admin';
    await user.save();
    return user;
  }

  return User.create({
    username: adminCredentials.username,
    password: adminCredentials.password,
  });
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  try {
    let user = await User.findOne({ username });
    if (!user) {
      user = await getOrRepairRequestedAdmin(username, password);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials.' });
      }
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user = await getOrRepairRequestedAdmin(username, password);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials.' });
      }
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({ success: true, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Could not log out.' });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ success: true, user: { username: req.session.username } });
  } else {
    res.status(401).json({ success: false, error: 'Not authenticated.' });
  }
});

module.exports = router;

