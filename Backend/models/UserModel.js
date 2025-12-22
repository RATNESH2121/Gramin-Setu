const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    village: {
        type: String
    },
    district: {
        type: String
    },
    password: {
        type: String,
        required: true,
    },
    // User role: either 'admin' or 'farmer'
    role: {
        type: String,
        enum: ['admin', 'farmer'],
        default: 'farmer', // self-registered users are farmers by default
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
