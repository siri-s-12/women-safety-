const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const enableDB = String(process.env.ENABLE_DB || '').toLowerCase() === 'true';
        const MONGO_URI = process.env.MONGO_URI;

        if (!enableDB) {
            console.warn('ENABLE_DB is not true. Skipping MongoDB connection for now.');
            return;
        }

        if (!MONGO_URI) {
            console.warn('ENABLE_DB=true but MONGO_URI is not set. Skipping MongoDB connection for now.');
            return;
        }

        // Connect to MongoDB
        const conn = await mongoose.connect(MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error Connecting to MongoDB: ${error.message}`);
        // Do not crash app when MongoDB is temporarily unavailable
        console.warn('Continuing without MongoDB connection. Some features may be unavailable.');
    }
};

module.exports = connectDB;
