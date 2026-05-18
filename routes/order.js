const express = require('express');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

const requireCustomerAuth = (req, res, next) => {
  if (req.session && req.session.customerId) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Customer authentication required.' });
};

router.post('/', async (req, res) => {
  const { items, customerName, customerEmail, customerPhone, customerAddress } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Cart items are required.' });
  }

  if (!customerName || !customerEmail) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  try {
    const sanitizedItems = items.map((item) => ({
      productId: item.productId,
      name: item.name || 'Product',
      category: item.category || '',
      image: item.image || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      isPro: !!item.isPro
    }));

    const subtotal = sanitizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal;

    const order = await Order.create({
      customer: req.session.customerId || null,
      customerName: String(customerName).trim(),
      customerEmail: String(customerEmail).trim().toLowerCase(),
      customerPhone: String(customerPhone || '').trim(),
      customerAddress: String(customerAddress || '').trim(),
      items: sanitizedItems,
      subtotal,
      total
    });

    if (req.session.customerId) {
      const customer = await Customer.findById(req.session.customerId);
      if (customer) {
        customer.isPro = customer.isPro || false;
      }
    }

    await sendEmail(
      order.customerEmail,
      'Order Confirmation | Cylin Painters',
      `<p>Thank you, ${order.customerName}! Your order has been received.</p>
      <p><strong>Order total:</strong> $${order.total.toFixed(2)}</p>
      <p>We’ll reach out once your order is being processed.</p>`
    );

    await sendEmail(
      'eutecticemmanuel@gmail.com',
      'New Order Received | Cylin Painters',
      `<p>A new order has been placed.</p>
      <p><strong>Name:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> ${order.customerEmail}</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>`
    );

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/me', requireCustomerAuth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.session.customerId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value.' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
