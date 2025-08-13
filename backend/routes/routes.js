const express = require('express');
const { body, validationResult } = require('express-validator');
const Route = require('../models/Route');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware for route data
const validateRoute = [
  body('route_id').isInt({ min: 1 }).withMessage('Route ID must be a positive integer'),
  body('distance').isFloat({ min: 0.1 }).withMessage('Distance must be at least 0.1 km'),
  body('traffic_level').isIn(['Low', 'Medium', 'High']).withMessage('Traffic level must be Low, Medium, or High'),
  body('base_time').isInt({ min: 1 }).withMessage('Base time must be at least 1 minute')
];

// @route   GET /api/routes
// @desc    Get all routes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const routes = await Route.find().sort({ route_id: 1 });
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ message: 'Server error while fetching routes' });
  }
});

// @route   GET /api/routes/:id
// @desc    Get route by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ message: 'Server error while fetching route' });
  }
});

// @route   POST /api/routes
// @desc    Create a new route
// @access  Private
router.post('/', auth, validateRoute, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { route_id, distance, traffic_level, base_time } = req.body;

    // Check if route_id already exists
    const existingRoute = await Route.findOne({ route_id });
    if (existingRoute) {
      return res.status(400).json({ message: 'Route ID already exists' });
    }

    const route = new Route({
      route_id,
      distance,
      traffic_level,
      base_time
    });

    await route.save();
    res.status(201).json(route);
  } catch (error) {
    console.error('Error creating route:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error while creating route' });
  }
});

// @route   PUT /api/routes/:id
// @desc    Update route
// @access  Private
router.put('/:id', auth, validateRoute, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { route_id, distance, traffic_level, base_time } = req.body;

    // Check if route_id already exists (excluding current route)
    const existingRoute = await Route.findOne({ 
      route_id, 
      _id: { $ne: req.params.id } 
    });
    if (existingRoute) {
      return res.status(400).json({ message: 'Route ID already exists' });
    }

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { route_id, distance, traffic_level, base_time },
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    console.error('Error updating route:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error while updating route' });
  }
});

// @route   DELETE /api/routes/:id
// @desc    Delete route
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ message: 'Server error while deleting route' });
  }
});

module.exports = router;