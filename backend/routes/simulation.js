const express = require('express');
const { body, validationResult } = require('express-validator');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const SimulationResult = require('../models/SimulationResult');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware for simulation parameters
const validateSimulation = [
  body('available_drivers').isInt({ min: 1 }).withMessage('Available drivers must be at least 1'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('max_hours_per_day').isInt({ min: 1, max: 24 }).withMessage('Max hours per day must be between 1 and 24')
];

// Helper function to convert time string to minutes
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes to time string
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Main simulation logic
const runDeliverySimulation = async (params) => {
  const { available_drivers, start_time, max_hours_per_day } = params;

  // Fetch data
  const drivers = await Driver.find().limit(available_drivers);
  const routes = await Route.find();
  const orders = await Order.find();

  if (drivers.length < available_drivers) {
    throw new Error(`Only ${drivers.length} drivers available, but ${available_drivers} requested`);
  }

  // Create route lookup
  const routeMap = {};
  routes.forEach(route => {
    routeMap[route.route_id] = route;
  });

  // Initialize simulation variables
  let totalProfit = 0;
  let onTimeDeliveries = 0;
  let lateDeliveries = 0;
  let totalFuelCost = 0;
  let totalSurcharge = 0;

  // Driver fatigue tracking (simplified - assume previous day data)
  const driverFatigue = {};
  drivers.forEach(driver => {
    // Check if driver worked >8 hours yesterday (use last day of past_week_hours)
    const yesterdayHours = driver.past_week_hours[driver.past_week_hours.length - 1];
    driverFatigue[driver._id] = yesterdayHours > 8 ? 0.7 : 1.0; // 30% speed decrease if fatigued
  });

  // Process each order
  for (const order of orders) {
    const route = routeMap[order.route_id];
    if (!route) continue;

    // Calculate fuel cost
    const baseFuelCost = route.distance * 5; // ₹5/km
    const surcharge = route.traffic_level === 'High' ? route.distance * 2 : 0; // ₹2/km for high traffic
    const orderFuelCost = baseFuelCost + surcharge;

    totalFuelCost += baseFuelCost;
    totalSurcharge += surcharge;

    // Simulate delivery time (simplified)
    const expectedDeliveryMinutes = timeToMinutes(order.delivery_time);
    const baseRouteMinutes = route.base_time;
    
    // Apply driver fatigue (randomly assign driver for simulation)
    const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
    const fatigueMultiplier = driverFatigue[randomDriver._id];
    const actualDeliveryMinutes = baseRouteMinutes / fatigueMultiplier;

    // Check if delivery is on time (within base time + 10 minutes)
    const isOnTime = actualDeliveryMinutes <= (baseRouteMinutes + 10);
    
    if (isOnTime) {
      onTimeDeliveries++;
      
      // High-value bonus: 10% bonus for orders >₹1000 delivered on time
      if (order.value_rs > 1000) {
        totalProfit += order.value_rs * 0.1; // 10% bonus
      }
    } else {
      lateDeliveries++;
      totalProfit -= 50; // ₹50 penalty for late delivery
    }

    // Add order value to profit and subtract fuel cost
    totalProfit += order.value_rs - orderFuelCost;
  }

  // Calculate efficiency score
  const totalDeliveries = onTimeDeliveries + lateDeliveries;
  const efficiencyScore = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

  return {
    total_profit: Math.round(totalProfit),
    efficiency_score: Math.round(efficiencyScore * 10) / 10,
    on_time_deliveries: onTimeDeliveries,
    late_deliveries: lateDeliveries,
    fuel_cost_breakdown: {
      base_cost: Math.round(totalFuelCost),
      surcharge: Math.round(totalSurcharge),
      total: Math.round(totalFuelCost + totalSurcharge)
    },
    simulation_params: params,
    timestamp: new Date().toISOString()
  };
};

// @route   POST /api/simulation/run
// @desc    Run delivery simulation
// @access  Private
router.post('/run', auth, validateSimulation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { available_drivers, start_time, max_hours_per_day } = req.body;

    // Check if we have enough drivers
    const driverCount = await Driver.countDocuments();
    if (available_drivers > driverCount) {
      return res.status(400).json({ 
        message: `Only ${driverCount} drivers available, but ${available_drivers} requested` 
      });
    }

    // Run simulation
    const result = await runDeliverySimulation({
      available_drivers,
      start_time,
      max_hours_per_day
    });

    // Save simulation result
    const simulationResult = new SimulationResult(result);
    await simulationResult.save();

    res.json(result);
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ 
      message: 'Simulation failed', 
      error: error.message 
    });
  }
});

// @route   GET /api/simulation/history
// @desc    Get simulation history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const results = await SimulationResult.find()
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await SimulationResult.countDocuments();

    res.json({
      results,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_results: total,
        has_next: skip + results.length < total,
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching simulation history:', error);
    res.status(500).json({ message: 'Server error while fetching simulation history' });
  }
});

// @route   GET /api/simulation/history/:id
// @desc    Get specific simulation result
// @access  Private
router.get('/history/:id', auth, async (req, res) => {
  try {
    const result = await SimulationResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Simulation result not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching simulation result:', error);
    res.status(500).json({ message: 'Server error while fetching simulation result' });
  }
});

// @route   DELETE /api/simulation/history/:id
// @desc    Delete simulation result
// @access  Private
router.delete('/history/:id', auth, async (req, res) => {
  try {
    const result = await SimulationResult.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Simulation result not found' });
    }
    res.json({ message: 'Simulation result deleted successfully' });
  } catch (error) {
    console.error('Error deleting simulation result:', error);
    res.status(500).json({ message: 'Server error while deleting simulation result' });
  }
});

module.exports = router;