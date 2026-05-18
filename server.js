require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoStoreModule = require('connect-mongo');
const MongoStore = mongoStoreModule.default || mongoStoreModule;
const path = require('path');
const connectDB = require('./config/db');
const seedDatabase = require('./config/seed');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const customerRoutes = require('./routes/customer');
const productRoutes = require('./routes/product');
const reviewRoutes = require('./routes/review');
const quoteRoutes = require('./routes/quotes');
const adminRoutes = require('./routes/admin');
const newsletterRoutes = require('./routes/newsletter');
const orderRoutes = require('./routes/order');
const User = require('./models/User');
const adminCredentials = require('./config/adminCredentials');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cylin';

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

async function startApp() {
  try {
    await connectDB();
    await ensureDefaultAdmin();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Cylin Painters server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

// Session middleware
let sessionStore;
try {
  // Try constructor first (v5.x and v6.x pattern)
  sessionStore = new MongoStore({
    mongoUrl: MONGO_URI,
    ttl: 60 * 60 * 24, // 1 day
  });
} catch (err) {
  console.warn('MongoStore constructor failed, trying .create() method:', err.message);
  try {
    // Fallback to .create() if constructor fails
    sessionStore = MongoStore.create({
      mongoUrl: MONGO_URI,
      ttl: 60 * 60 * 24, // 1 day
    });
  } catch (err2) {
    console.warn('MongoStore.create() also failed, using memory store:', err2.message);
    // Will use default express-session memory store
    sessionStore = undefined;
  }
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  store: sessionStore,
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
app.use('/api/quotes', quoteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

// Fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start application
startApp().catch(err => {
  console.error('Fatal error starting app:', err);
  process.exit(1);
});

