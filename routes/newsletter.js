const express = require('express');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { sendEmail } = require('../utils/email');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    let subscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });

    if (!subscriber) {
      subscriber = await NewsletterSubscriber.create({
        email: normalizedEmail,
        name: name ? String(name).trim() : ''
      });
    }

    await sendEmail(
      normalizedEmail,
      'Welcome to Cylin Painters Newsletter',
      `<p>Thanks for subscribing to the Cylin Painters newsletter.</p><p>We’ll send exclusive painting ideas, promotions, and product updates straight to your inbox.</p>`
    );

    res.json({ success: true, message: 'Subscribed successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.json({ success: true, message: 'You are already subscribed.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    res.json({ success: true, subscribers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
