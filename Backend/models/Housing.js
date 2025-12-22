const mongoose = require('mongoose');

const HousingSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    beneficiary: {
        type: String,
        required: true,
    },
    village: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Completed', 'In Progress', 'Foundation', 'Sanctioned'],
        default: 'Sanctioned',
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    fundsReleased: {
        type: String,
        required: true,
    },
    totalFunds: {
        type: String,
        required: true,
    },
    startDate: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Housing', HousingSchema);
