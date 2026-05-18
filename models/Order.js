const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  category: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true, default: 1 },
  isPro: { type: Boolean, default: false }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  items: { type: [orderItemSchema], required: true, default: [] },
  subtotal: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
