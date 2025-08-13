const express = require('express');
const { body, validationResult } = require('express-validator');
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware for driver data
const validateDriver = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('shift_hours').isInt({ min: 1, max: 24 }).withMessage('Shift hours must be between 1 and 24'),
  body('past_week_hours').isArray({ min: 7, max: 7 }).withMessage('Past week hours must be an array of 7 numbers'),
  body('past_week_hours.*').isInt({ min: 0, max: 24 }).withMessage('Each day hours must be between 0 and 24')
];

// @route   GET /api/drivers
// @desc    Get all drivers
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Server error while fetching drivers' });
  }
});

// @route   GET /api/drivers/:id
// @desc    Get driver by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ message: 'Server error while fetching driver' });
  }
});

// @route   POST /api/drivers
// @desc    Create a new driver
// @access  Private
router.post('/', auth, validateDriver, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, shift_hours, past_week_hours } = req.body;

    const driver = new Driver({
      name,
      shift_hours,
      past_week_hours
    });

    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    console.error('Error creating driver:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error while creating driver' });
  }
});

// @route   PUT /api/drivers/:id
// @desc    Update driver
// @access  Private
router.put('/:id', auth, validateDriver, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, shift_hours, past_week_hours } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { name, shift_hours, past_week_hours },
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Error updating driver:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error while updating driver' });
  }
});

// @route   DELETE /api/drivers/:id
// @desc    Delete driver
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ message: 'Server error while deleting driver' });
  }
});

module.exports = router;