require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const customerRoutes = require('./routes/customer');
const productRoutes = require('./routes/product');
const reviewRoutes = require('./routes/review');
const adminRoutes = require('./routes/admin');
const User = require('./models/User');
const adminCredentials = require('./config/adminCredentials');

const app = express();
const PORT = process.env.PORT || 3000;

async function ensureDefaultAdmin() {
  try {
    const admin = await User.findOne({
      username: { $in: [adminCredentials.username, ...adminCredentials.legacyUsernames] },
    });

    if (admin) {
      admin.username = adminCredentials.username;
      admin.password = adminCredentials.password;
      admin.role = admin.role || 'admin';
      await admin.save();
    } else {
      await User.create({
        username: adminCredentials.username,
        password: adminCredentials.password,
      });
    }
    console.log(`Admin account ready: ${adminCredentials.username}`);
  } catch (error) {
    console.error(`Admin account setup failed: ${error.message}`);
  }
}

// Connect to MongoDB
connectDB().then(ensureDefaultAdmin);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Explicit routes for new pages
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

// API routes
app.use('/api', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Cylin Painters server running on http://localhost:${PORT}`);
});

