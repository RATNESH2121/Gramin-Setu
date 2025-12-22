const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    soilType: {
        type: String,
        required: true,
    },
    nitrogen: {
        type: String,
        required: true,
    },
    phosphorus: {
        type: String,
        required: true,
    },
    potassium: {
        type: String,
        required: true,
    },
    tips: {
        type: [String],
        required: true,
    },
    estimatedCost: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// Compound index to ensure unique Recommendation for Crop + Soil
CropSchema.index({ name: 1, soilType: 1 }, { unique: true });

module.exports = mongoose.model('Crop', CropSchema);
