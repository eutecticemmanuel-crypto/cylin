const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// Middleware to check if user is authenticated as admin
const adminAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }
  next();
};

// GET /api/admin/members - Get all registered members/customers
router.get('/members', adminAuth, async (req, res) => {
  try {
    const customers = await Customer.find().select('-__v').sort({ createdAt: -1 });
    const totalCount = await Customer.countDocuments();
    
    res.json({
      success: true,
      data: customers,
      totalCount: totalCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/announcements - Get all announcements
router.get('/announcements', adminAuth, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: announcements,
      totalCount: announcements.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/announcements - Create new announcement
router.post('/announcements', adminAuth, async (req, res) => {
  try {
    const { title, message } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required.' });
    }

    const announcement = new Announcement({
      title,
      message,
      createdBy: req.session.username,
      status: 'draft'
    });

    await announcement.save();
    
    res.json({
      success: true,
      message: 'Announcement created successfully.',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/announcements/:id/send - Send announcement to all members
router.post('/announcements/:id/send', adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found.' });
    }

    if (announcement.status === 'sent') {
      return res.status(400).json({ success: false, error: 'This announcement has already been sent.' });
    }

    // Get all customers with email
    const customers = await Customer.find({ email: { $exists: true, $ne: '' } });
    
    if (customers.length === 0) {
      return res.status(400).json({ success: false, error: 'No customers with email addresses found.' });
    }

    // Send emails to all customers
    const emailPromises = customers.map(customer => {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="border-bottom: 3px solid #FF6B6B; padding-bottom: 15px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0;">📢 ${announcement.title}</h2>
            </div>
            <div style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              <p>Hello ${customer.name || 'Valued Customer'},</p>
              ${announcement.message.split('\n').map(para => `<p>${para}</p>`).join('')}
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #FF6B6B; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                <strong>From:</strong> Cylin Painters Admin<br>
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
              </p>
            </div>
            <div style="border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an announcement from Cylin Painters. For any inquiries, please contact us.
              </p>
            </div>
          </div>
        </div>
      `;

      return sendEmail(
        customer.email,
        `📢 ${announcement.title}`,
        htmlContent
      );
    });

    const results = await Promise.allSettled(emailPromises);
    
    // Count successful sends
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    
    // Update announcement status
    announcement.status = 'sent';
    announcement.sentAt = new Date();
    announcement.recipientCount = successCount;
    await announcement.save();

    res.json({
      success: true,
      message: `Announcement sent to ${successCount} customer(s).`,
      data: {
        totalRecipients: customers.length,
        successfulSends: successCount,
        failedSends: customers.length - successCount,
        announcement: announcement
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/announcements/:id - Update announcement (draft only)
router.put('/announcements/:id', adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found.' });
    }

    if (announcement.status === 'sent') {
      return res.status(400).json({ success: false, error: 'Cannot update sent announcements.' });
    }

    const { title, message } = req.body;
    
    if (title) announcement.title = title;
    if (message) announcement.message = message;

    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement updated successfully.',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/announcements/:id - Delete announcement
router.delete('/announcements/:id', adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found.' });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
