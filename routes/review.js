const express = require('express');
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Middleware to check if customer is logged in
const requireCustomerAuth = (req, res, next) => {
  if (req.session && req.session.customerId) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Customer authentication required.' });
};

// GET /api/reviews (public - approved reviews)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate('customer', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reviews/product/:productId
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews (customer only)
router.post('/', requireCustomerAuth, async (req, res) => {
  const { product, rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ success: false, error: 'Rating and comment are required.' });
  }

  try {
    const newReview = await Review.create({
      customer: req.session.customerId,
      product: product || null,
      rating,
      comment
    });

    // Send email notification
    const emailHtml = `
      <h2>New Review Submitted</h2>
      <p><strong>Rating:</strong> ${rating}/5</p>
      <p><strong>Comment:</strong></p>
      <p>${comment}</p>
      <p>Please review and approve in the admin dashboard.</p>
    `;

    await sendEmail('eutecticemmanuel@gmail.com', 'New Review Submitted on Cylin Painters', emailHtml);

    res.status(201).json({ success: true, review: newReview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reviews/admin (admin only - all reviews)
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('customer', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/reviews/:id/approve (admin only)
router.put('/:id/approve', requireAuth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('customer', 'name email');
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/reviews/:id (admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;