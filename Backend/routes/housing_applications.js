const express = require('express');
const router = express.Router();
const HousingApplication = require('../models/HousingApplication');
const User = require('../models/UserModel');

// Create a new application
router.post('/apply', async (req, res) => {
    try {
        const { applicantId, familySize, annualIncome, category, address, currentHousingStatus, documents } = req.body;

        // Validation (Basic)
        if (!applicantId || !address || !currentHousingStatus) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Generate Application ID (H-101 style)
        const count = await HousingApplication.countDocuments();
        const applicationId = `H-${100 + count + 1}`;

        const newApplication = new HousingApplication({
            applicantId,
            applicationId,
            familySize,
            annualIncome,
            category,
            address,
            currentHousingStatus,
            documents
        });

        await newApplication.save();
        res.status(201).json(newApplication);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get applications for a specific user (Farmer View)
router.get('/my-applications/:userId', async (req, res) => {
    try {
        const apps = await HousingApplication.find({ applicantId: req.params.userId }).sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all applications (Admin View) with optional filtering
router.get('/all', async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) {
            query.status = status;
        }

        const apps = await HousingApplication.find(query)
            .populate('applicantId', 'name email phone') // Populate user details
            .sort({ createdAt: -1 });

        res.json(apps);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Application Status (Admin Action)
router.put('/status/:id', async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const app = await HousingApplication.findById(req.params.id);

        if (!app) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (status) app.status = status;
        if (remarks) app.adminRemarks = remarks;

        await app.save();
        res.json(app);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
