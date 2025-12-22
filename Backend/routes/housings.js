const express = require('express');
const router = express.Router();
const Housing = require('../models/Housing');

// Get all housings with optional search
router.get('/', async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query = {
                $or: [
                    { id: searchRegex },
                    { beneficiary: searchRegex },
                    { village: searchRegex },
                    { district: searchRegex }
                ]
            };
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const housings = await Housing.find(query);
        res.json(housings);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Add Housing Project
router.post('/', async (req, res) => {
    try {
        const newHousing = new Housing(req.body);
        const housing = await newHousing.save();
        res.json(housing);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
