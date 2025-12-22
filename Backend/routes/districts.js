const express = require('express');
const router = express.Router();
const District = require('../models/District');

// Get all districts
router.get('/', async (req, res) => {
    try {
        const districts = await District.find().sort({ name: 1 });
        res.json(districts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new district
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'District name is required' });

        const existing = await District.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) return res.status(400).json({ error: 'District already exists' });

        const district = new District({ name });
        await district.save();
        res.status(201).json(district);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
