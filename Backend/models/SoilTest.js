const mongoose = require('mongoose');

const SoilTestSchema = new mongoose.Schema({
    landId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LandParcel',
        required: true
    },
    nitrogen: {
        type: Number,
        required: true
    },
    phosphorus: {
        type: Number,
        required: true
    },
    potassium: {
        type: Number,
        required: true
    },
    ph: {
        type: Number,
        required: true
    },
    approved: {
        type: Boolean,
        default: false
    },
    organicMatter: {
        type: String,
        default: 'Low'
    },
    recommendation: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('SoilTest', SoilTestSchema);
