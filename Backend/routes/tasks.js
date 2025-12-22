const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../models/UserModel'); // Assuming auth middleware usage if available, but for now just basic structure or user passed in body/query or simple logic. 
// Note: In a real app we'd use middleware. Based on other files, I'll check auth usage.
// Assuming simple implementation for now to match user context.

// Get all tasks for a user
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query; // Simple query param for now, or match existing auth pattern
        if (!userId) return res.status(400).json('User ID required');

        const tasks = await Task.find({ userId }).populate('landId').sort({ dueDate: 1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json('Error ' + err);
    }
});

// Create a task
router.post('/', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.json(savedTask);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Update task
router.patch('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Delete task
router.delete('/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json('Task deleted.');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

module.exports = router;
