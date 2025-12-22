const mongoose = require('mongoose');

const GISLayerSchema = new mongoose.Schema({
    layerId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('GISLayer', GISLayerSchema);
