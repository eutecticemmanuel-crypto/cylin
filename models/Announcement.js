const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: { type: String, required: true }, // Admin username
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date, default: null },
  status: { type: String, enum: ['draft', 'sent'], default: 'draft' },
  recipientCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Announcement', announcementSchema);
