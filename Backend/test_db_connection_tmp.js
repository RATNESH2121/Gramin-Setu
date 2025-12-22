const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        const uri = process.env.MONGO_URI;
        // Check if URI contains the problematic unencoded @
        // The regex checks if there are two @ symbols where the first isn't followed by something that looks like a host
        // Actually simplest check: verify it contains %40
        if (!uri.includes('%40') && uri.split('@').length > 2) {
            console.log('WARNING: URI appears to contain unencoded @ in password!');
        }

        await mongoose.connect(uri);
        console.log('MongoDB Connected Successfully');
        process.exit(0);
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

connectDB();
