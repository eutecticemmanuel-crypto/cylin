const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cylin';
  try {
    const conn = await mongoose.connect(mongoUri, {
      // Mongoose 8+ no longer needs these options, but keeping for compatibility
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB (${mongoUri}): ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

