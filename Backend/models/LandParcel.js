const mongoose = require('mongoose');

const LandParcelSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    area: {
        type: Number,
        required: true
    },
    crop: {
        type: String,
        required: true
    },
    soilType: {
        type: String,
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    status: {
        type: String,
        default: 'Pending'
    },
    nextAction: {
        type: String,
        default: 'Fertilization'
    }
}, { timestamps: true });

module.exports = mongoose.model('LandParcel', LandParcelSchema);
