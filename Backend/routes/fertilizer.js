const express = require('express');
const router = express.Router();
const LandParcel = require('../models/LandParcel');
const SoilTest = require('../models/SoilTest');
const FertilizerPlan = require('../models/FertilizerPlan');
const User = require('../models/UserModel');

// --- Middleware for checking roles (Simplified for clarity) ---
// Ideally, use a proper auth middleware that populates req.user from token

const checkFarmer = async (req, res, next) => {
    // For now, we assume req.headers['user-id'] is passed.
    // In a real app, verify JWT.
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ message: 'Unauthorized: No User ID' });

    try {
        req.user = { id: userId, role: 'farmer' };
        const user = await User.findById(userId);
        if (user && user.role === 'farmer') {
            req.user = user;
            next();
        } else {
            return res.status(403).json({ message: 'Access denied: Farmers only' });
        }
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid User ID' });
    }
};

const checkAdmin = async (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ message: 'Unauthorized: No User ID' });

    try {
        const user = await User.findById(userId);
        if (user && user.role === 'admin') {
            req.user = user;
            next();
        } else {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid User ID' });
    }
};


// ---------------- FARMER ROUTES ----------------

// 1. Add Land Parcel
router.post('/land', checkFarmer, async (req, res) => {
    try {
        const { area, crop, soilType, latitude, longitude } = req.body;
        const land = new LandParcel({
            farmerId: req.user._id,
            area,
            crop,
            soilType,
            latitude,
            longitude,
            status: 'Pending'
        });
        await land.save();
        res.status(201).json(land);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. View My Land Parcels
router.get('/land', checkFarmer, async (req, res) => {
    try {
        const lands = await LandParcel.find({ farmerId: req.user._id });
        res.json(lands);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Enter Soil Data
router.post('/soil', checkFarmer, async (req, res) => {
    try {
        const { landId, nitrogen, phosphorus, potassium, ph } = req.body;

        // Verify land belongs to farmer
        const land = await LandParcel.findOne({ _id: landId, farmerId: req.user._id });
        if (!land) return res.status(404).json({ message: 'Land not found or unauthorized' });

        const soil = new SoilTest({
            landId,
            nitrogen,
            phosphorus,
            potassium,
            ph,
            approved: false
        });
        await soil.save();
        res.status(201).json(soil);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Get My Soil Tests
router.get('/soil', checkFarmer, async (req, res) => {
    try {
        const tests = await SoilTest.find({
            landId: { $in: await LandParcel.find({ farmerId: req.user._id }).distinct('_id') }
        }).populate('landId', 'crop area');
        res.json(tests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. View Fertilizer Recommendations (Plans)
router.get('/plans/:landId', checkFarmer, async (req, res) => {
    try {
        const plans = await FertilizerPlan.find({ landId: req.params.landId }).populate('landId');
        res.json(plans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ---------------- ADMIN ROUTES ----------------

// 1. View All Land Parcels
router.get('/admin/lands', checkAdmin, async (req, res) => {
    try {
        const lands = await LandParcel.find().populate('farmerId', 'name village district');
        res.json(lands);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. View Pending Soil Entries
router.get('/admin/soil/pending', checkAdmin, async (req, res) => {
    try {
        // Find soil tests where approved is false
        // Populate land info and farmer info
        const soils = await SoilTest.find({ approved: false })
            .populate({
                path: 'landId',
                populate: { path: 'farmerId', select: 'name' }
            });
        res.json(soils);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Approve/Reject Soil Entry
router.put('/admin/soil/:id/status', checkAdmin, async (req, res) => {
    try {
        const { approved } = req.body; // true or false
        const soil = await SoilTest.findByIdAndUpdate(
            req.params.id,
            { approved: approved },
            { new: true }
        );
        res.json(soil);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Generate Fertilizer Plan
router.post('/admin/plan', checkAdmin, async (req, res) => {
    try {
        const { landId, recommendedFertilizer, quantity, schedule, duration, yieldIncrease, nextApplication, nValue, pValue, kValue } = req.body;

        // Check if soil is approved for this land? Optional rule.

        const plan = new FertilizerPlan({
            landId,
            recommendedFertilizer,
            quantity,
            schedule,
            duration,
            yieldIncrease,
            nextApplication,
            nValue,
            pValue,
            kValue,
            createdBy: req.user._id
        });
        await plan.save();

        // Also update land status to Approved
        await LandParcel.findByIdAndUpdate(landId, { status: 'Approved' });

        res.status(201).json(plan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Dashboard Stats
router.get('/admin/stats', checkAdmin, async (req, res) => {
    try {
        const usersCount = await User.countDocuments({ role: 'farmer' });
        const landsCount = await LandParcel.countDocuments();
        const pendingSoilCount = await SoilTest.countDocuments({ approved: false });
        res.json({ usersCount, landsCount, pendingSoilCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 6. Chart Data
router.get('/admin/charts', checkAdmin, async (req, res) => {
    try {
        // User Growth (Mock or Aggregate)
        // For now, let's just return some dummy historical data if real data isn't timestamped enough
        // Ideally: await User.aggregate(...)
        const userGrowth = [
            { name: 'Jan', value: 45 },
            { name: 'Feb', value: 52 },
            { name: 'Mar', value: 60 },
            { name: 'Apr', value: 75 },
            { name: 'May', value: 85 },
            { name: 'Jun', value: 98 }, // Real implementation would group by createdAt
        ];

        // Land Distribution by Crop
        const landDist = await LandParcel.aggregate([
            { $group: { _id: '$crop', value: { $sum: '$area' } } }
        ]);
        const formattedLandDist = landDist.map(l => ({ name: l._id || 'Unknown', value: l.value }));

        res.json({ userGrowth, landDist: formattedLandDist });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
