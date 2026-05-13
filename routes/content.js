const express = require('express');
const SiteContent = require('../models/SiteContent');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const requestedContactDefaults = {
  address: 'Kampala, Uganda',
  phone: '0700892678\nWhatsApp: 0700892678',
  email: 'mukiibif00@gmail.com',
};

const requestedSocialDefaults = {
  tiktok: 'https://www.tiktok.com/@painterfrank.mukiibi',
  pinterest: 'https://pin.it/2reyO8vPo',
  whatsapp: 'https://wa.me/256700892678',
};

function applyContactDefaults(result) {
  result.contact = result.contact || {};
  result.contact.info = result.contact.info || {};

  const placeholderInfo = {
    address: '123 Color Avenue\nDesign District, NY 10001',
    phone: '(555) 123-4567\nMon - Sat: 8am - 6pm',
    email: 'info@cylinpainters.com\nquotes@cylinpainters.com',
  };

  Object.keys(requestedContactDefaults).forEach((key) => {
    if (!result.contact.info[key] || result.contact.info[key] === placeholderInfo[key]) {
      result.contact.info[key] = requestedContactDefaults[key];
    }
  });

  result.social = result.social || {};
  Object.keys(requestedSocialDefaults).forEach((key) => {
    if (!result.social[key]) {
      result.social[key] = requestedSocialDefaults[key];
    }
  });
}

// GET /api/content — fetch all content (public)
router.get('/', async (req, res) => {
  try {
    const contents = await SiteContent.find({});
    const result = {};
    contents.forEach((c) => {
      result[c.section] = c.data;
    });
    applyContactDefaults(result);
    res.json({ success: true, content: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/content/:section — fetch specific section (public)
router.get('/:section', async (req, res) => {
  try {
    const content = await SiteContent.findOne({ section: req.params.section });
    if (!content) {
      return res.status(404).json({ success: false, error: 'Section not found.' });
    }
    const result = { [req.params.section]: content.data };
    applyContactDefaults(result);
    res.json({ success: true, data: result[req.params.section] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/content/:section — update section (admin only)
router.put('/:section', requireAuth, async (req, res) => {
  try {
    const content = await SiteContent.findOneAndUpdate(
      { section: req.params.section },
      { data: req.body, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: content.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

