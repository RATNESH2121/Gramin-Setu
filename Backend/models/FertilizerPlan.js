const mongoose = require('mongoose');

const FertilizerPlanSchema = new mongoose.Schema({
    landId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LandParcel',
        required: true
    },
    recommendedFertilizer: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    schedule: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Active' // Active, Review, Completed
    },
    duration: {
        type: String, // e.g., "120 days"
    },
    yieldIncrease: {
        type: String, // e.g., "15%"
    },
    nextApplication: {
        type: String, // e.g., "Tomorrow"
    },
    nValue: { type: Number },
    pValue: { type: Number },
    kValue: { type: Number },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('FertilizerPlan', FertilizerPlanSchema);
