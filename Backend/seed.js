const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Crop = require('./models/Crop');
const Housing = require('./models/Housing');
const GISLayer = require('./models/GISLayer');

dotenv.config();

const cropData = [
    { name: 'wheat', soilType: 'alluvial', nitrogen: '120 kg/ha', phosphorus: '60 kg/ha', potassium: '40 kg/ha', tips: ['Apply nitrogen in 3 splits', 'Use Urea for nitrogen source', 'First irrigation at 21 days'], estimatedCost: '₹4,500/acre' },
    { name: 'wheat', soilType: 'black', nitrogen: '100 kg/ha', phosphorus: '50 kg/ha', potassium: '30 kg/ha', tips: ['Black soil retains moisture well', 'Reduce irrigation frequency', 'Apply DAP at sowing'], estimatedCost: '₹3,800/acre' },
    { name: 'wheat', soilType: 'red', nitrogen: '130 kg/ha', phosphorus: '70 kg/ha', potassium: '50 kg/ha', tips: ['Red soil needs more organic matter', 'Consider adding compost', 'Mulching recommended'], estimatedCost: '₹5,200/acre' },
    { name: 'wheat', soilType: 'laterite', nitrogen: '140 kg/ha', phosphorus: '80 kg/ha', potassium: '60 kg/ha', tips: ['Add lime to correct acidity', 'Use split application of nitrogen', 'Regular soil testing advised'], estimatedCost: '₹5,800/acre' },
];

const housingData = [
    { id: 'PMAY-G-2024-001234', beneficiary: 'Ramesh Kumar', village: 'Chandpur', district: 'Sitapur', state: 'Uttar Pradesh', status: 'In Progress', progress: 65, fundsReleased: '₹1,20,000', totalFunds: '₹1,50,000', startDate: 'Jan 2024' },
    { id: 'PMAY-G-2024-001235', beneficiary: 'Sunita Devi', village: 'Ramgarh', district: 'Patna', state: 'Bihar', status: 'Completed', progress: 100, fundsReleased: '₹1,50,000', totalFunds: '₹1,50,000', startDate: 'Sep 2023' },
];

const layerData = [
    { layerId: 'agricultural', name: 'Agricultural Land', color: 'bg-primary', count: 12456, active: true },
    { layerId: 'housing', name: 'Housing Projects', color: 'bg-teal', count: 5234, active: true },
    { layerId: 'water', name: 'Water Bodies', color: 'bg-blue-500', count: 892, active: false },
    { layerId: 'roads', name: 'Road Networks', color: 'bg-golden', count: 3421, active: false },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        await Crop.deleteMany({});
        await Crop.insertMany(cropData);
        console.log('Crops Seeded');

        await Housing.deleteMany({});
        await Housing.insertMany(housingData);
        console.log('Housings Seeded');

        await GISLayer.deleteMany({});
        await GISLayer.insertMany(layerData);
        console.log('GIS Layers Seeded');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
