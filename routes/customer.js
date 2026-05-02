const express = require('express');
const Customer = require('../models/Customer');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// POST /api/customers/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, address, interests } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  try {
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ success: false, error: 'Email already registered.' });
    }

    const newCustomer = await Customer.create({
      name,
      email,
      password,
      phone: phone || '',
      address: address || '',
      interests: interests || []
    });

    // Send welcome email
    const emailHtml = `
      <h2>Welcome to Cylin Painters!</h2>
      <p>Thank you for registering, ${name}!</p>
      <p>You can now view our products and leave reviews.</p>
    `;

    await sendEmail(email, 'Welcome to Cylin Painters', emailHtml);

    res.status(201).json({ success: true, customer: { name: newCustomer.name, email: newCustomer.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/customers/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    req.session.customerId = customer._id;
    req.session.customerName = customer.name;

    res.json({ success: true, customer: { name: customer.name, email: customer.email, isPro: customer.isPro } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/customers/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Could not log out.' });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

// GET /api/customers/me
router.get('/me', (req, res) => {
  if (req.session && req.session.customerId) {
    res.json({ success: true, customer: { name: req.session.customerName } });
  } else {
    res.status(401).json({ success: false, error: 'Not authenticated.' });
  }
});

module.exports = router;