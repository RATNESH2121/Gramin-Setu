const express = require('express');
const router = express.Router();
const GISLayer = require('../models/GISLayer');
const LandParcel = require('../models/LandParcel');
const Housing = require('../models/Housing');

// Get all layers (Real Data with Role Filtering)
router.get('/layers', async (req, res) => {
    try {
        const { role, userId } = req.query; // Passed from frontend if logged in

        let landQuery = { status: 'Approved' }; // Default public see only approved
        let housingQuery = {};

        // Role-based filtering
        if (role === 'farmer' && userId) {
            landQuery = { farmerId: userId }; // Farmer sees ONLY own land
        } else if (role === 'admin') {
            landQuery = {}; // Admin sees all
        }

        const HousingApplication = require('../models/HousingApplication');

        const lands = await LandParcel.find(landQuery).select('latitude longitude crop area status');

        // Fetch Completed/Approved Housing Beneficiaries
        const beneficiaries = await HousingApplication.find({ status: 'Approved' }).populate('applicantId', 'name');

        // Fetch Pending Applications
        const pendingApps = await HousingApplication.find({ status: 'Pending' }).populate('applicantId', 'name');

        // Transform to layer format expected by frontend
        const agriculturalLayer = {
            id: 'agricultural',
            layerId: 'agricultural',
            name: 'Agricultural Lands',
            active: true,
            color: 'bg-primary',
            count: lands.length,
            data: lands.map(l => ({
                lat: l.latitude || 20.5937 + (Math.random() - 0.5),
                lng: l.longitude || 78.9629 + (Math.random() - 0.5),
                properties: { crop: l.crop, area: l.area, status: l.status }
            }))
        };

        const housingLayer = {
            id: 'housing',
            layerId: 'housing',
            name: 'Housing Beneficiaries',
            active: true,
            color: 'bg-teal',
            count: beneficiaries.length,
            data: beneficiaries.map(h => ({
                lat: h.address.latitude || 20.5937 + (Math.random() - 0.5) * 5,
                lng: h.address.longitude || 78.9629 + (Math.random() - 0.5) * 5,
                properties: { status: h.status, village: h.address.village, beneficiary: h.applicantId?.name || 'Unknown' }
            }))
        };

        const pendingLayer = {
            id: 'pending_housing',
            layerId: 'pending_housing',
            name: 'Pending Applications',
            active: false,
            color: 'bg-yellow', // distinctive color
            count: pendingApps.length,
            data: pendingApps.map(h => ({
                lat: h.address.latitude || 20.5937 + (Math.random() - 0.5) * 5,
                lng: h.address.longitude || 78.9629 + (Math.random() - 0.5) * 5,
                properties: { status: h.status, village: h.address.village, beneficiary: h.applicantId?.name || 'Unknown' }
            }))
        };

        res.json([agriculturalLayer, housingLayer, pendingLayer]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Initialize Layers (Internal/Seed)
router.post('/seed', async (req, res) => {
    try {
        await GISLayer.deleteMany({});
        const layers = [
            { layerId: 'agricultural', name: 'Agricultural Land', color: 'bg-primary', count: 12456 },
            { layerId: 'housing', name: 'Housing Projects', color: 'bg-teal', count: 5234 },
            { layerId: 'water', name: 'Water Bodies', color: 'bg-blue-500', active: false, count: 892 },
            { layerId: 'roads', name: 'Road Networks', color: 'bg-golden', active: false, count: 3421 },
        ];
        await GISLayer.insertMany(layers);
        res.json({ message: 'Layers seeded' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
