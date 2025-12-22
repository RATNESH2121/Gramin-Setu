const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

// Get all crops
router.get('/', async (req, res) => {
    try {
        const crops = await Crop.find();
        res.json(crops);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Smart Recommendation Engine (Heuristic-based AI)
const generateSmartRecommendation = (cropName, soilType) => {
    // 1. Base Requirements (Average NPK in kg/ha)
    const baseRequirements = {
        wheat: { n: 120, p: 60, k: 40, cost: 4500 },
        rice: { n: 100, p: 50, k: 50, cost: 4200 },
        cotton: { n: 120, p: 60, k: 60, cost: 5500 },
        sugarcane: { n: 150, p: 80, k: 90, cost: 6800 },
        maize: { n: 120, p: 60, k: 50, cost: 4800 },
        potato: { n: 150, p: 80, k: 100, cost: 7000 },
        tomato: { n: 100, p: 60, k: 60, cost: 6000 }
    };

    // Default to strict average if crop unknown
    let req = baseRequirements[cropName.toLowerCase()] || { n: 100, p: 50, k: 50, cost: 5000 };

    // 2. Soil Factor Adjustments
    const soil = soilType.toLowerCase();

    // Nitrogen adjustments
    if (soil.includes('black')) req.n *= 0.9; // Fertile, holds nutrients
    if (soil.includes('red') || soil.includes('sandy')) req.n *= 1.1; // Leaching prone

    // Phosphorus adjustments
    if (soil.includes('laterite') || soil.includes('red')) req.p *= 1.2; // High fixation
    if (soil.includes('alluvial')) req.p *= 1.0; // Generally balanced

    // Potassium adjustments
    if (soil.includes('laterite')) req.k *= 1.1; // Often deficient
    if (soil.includes('black')) req.k *= 1.0; // Usually sufficient

    // Round values
    req.n = Math.round(req.n);
    req.p = Math.round(req.p);
    req.k = Math.round(req.k);

    // 3. Generate Dynamic Tips
    const tips = [
        `Apply Nitrogen in split doses for better efficiency in ${soilType} soil.`,
        `Consider organic manure to improve water retention for ${cropName}.`
    ];

    if (req.n > 130) tips.push("High Nitrogen requirement: careful with application timing.");
    if (soil.includes('red')) tips.push("Mulching is highly recommended to conserve moisture.");
    if (cropName.toLowerCase() === 'rice') tips.push("Maintain standing water during critical growth stages.");

    return {
        name: cropName,
        soilType: soilType,
        nitrogen: `${req.n} kg/ha`,
        phosphorus: `${req.p} kg/ha`,
        potassium: `${req.k} kg/ha`,
        tips: tips,
        estimatedCost: `₹${req.cost}/acre (approx)`
    };
};

// Get Recommendation by Crop Name and Soil Type
router.get('/:name/:soilType', async (req, res) => {
    try {
        const { name, soilType } = req.params;

        // 1. Try DB first
        let crop = await Crop.findOne({
            name: new RegExp(`^${name}$`, 'i'),
            soilType: new RegExp(`^${soilType}$`, 'i')
        });

        // 2. Fallback to AI Engine
        if (!crop) {
            console.log(`[AI Planner] Generating smart recommendation for ${name} on ${soilType}`);
            crop = generateSmartRecommendation(name, soilType);
        }

        res.json(crop);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Crop Data
router.post('/', async (req, res) => {
    try {
        const newCrop = new Crop(req.body);
        const crop = await newCrop.save();
        res.json(crop);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
