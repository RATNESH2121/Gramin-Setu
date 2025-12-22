const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug Middleware removed
// app.use((req, res, next) => { ... });

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

connectDB();

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
const cropRoutes = require('./routes/crops');
const housingRoutes = require('./routes/housings');
const gisRoutes = require('./routes/gis');
const adminRoutes = require('./routes/admin');
const taskRoutes = require('./routes/tasks');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/housings', housingRoutes);
app.use('/api/gis', gisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/housing-apps', require('./routes/housing_applications'));
app.use('/api/fertilizer', require('./routes/fertilizer'));
app.use('/api/districts', require('./routes/districts'));
app.use('/api/contact', require('./routes/contact'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
