const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    block: {
        type: String,
        required: true
    },
    gramPanchayat: {
        type: String,
        required: true
    },
    village: {
        type: String,
        required: true
    },
    houseNumber: {
        type: String
    },
    landmark: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    }
}, { _id: false });

module.exports = AddressSchema;
