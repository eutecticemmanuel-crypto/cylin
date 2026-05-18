const mongoose = require('mongoose');

const quoteRequestSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  quote: { type: String, required: true },
  memberName: { type: String, default: '' },
  memberEmail: { type: String, default: '' },
  source: { type: String, default: 'ai' },
  status: { type: String, enum: ['new', 'reviewed', 'closed'], default: 'new' }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuoteRequest', quoteRequestSchema);
