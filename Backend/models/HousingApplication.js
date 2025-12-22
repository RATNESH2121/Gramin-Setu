const mongoose = require('mongoose');
const AddressSchema = require('./AddressSchema');

const HousingApplicationSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicationId: {
        type: String,
        required: true,
        unique: true
    },
    familySize: {
        type: Number,
        required: true
    },
    annualIncome: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['General', 'SC', 'ST', 'OBC'],
        required: true
    },
    address: {
        type: AddressSchema,
        required: true
    },
    currentHousingStatus: {
        ownsHouse: { type: Boolean, required: true },
        houseCondition: {
            type: String,
            enum: ['Kutcha', 'Semi-Pucca', 'No House', 'Pucca'],
            required: function () { return this.currentHousingStatus.ownsHouse; }
        },
        ownsLand: { type: Boolean, required: true },
        landParcelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LandParcel'
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Verification Required', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    documents: {
        identityProof: { type: String }, // URL or path
        housePhoto: { type: String }    // URL or path
    },
    adminRemarks: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('HousingApplication', HousingApplicationSchema);
