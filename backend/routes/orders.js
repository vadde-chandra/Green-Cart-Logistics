const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Route = require('../models/Route');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware for order data
const validateOrder = [
  body('order_id').isInt({ min: 1 }).withMessage('Order ID must be a positive integer'),
  body('value_rs').isInt({ min: 1 }).withMessage('Order value must be at least ₹1'),
  body('route_id').isInt({ min: 1 }).withMessage('Route ID must be a positive integer'),
  body('delivery_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Delivery time must be in HH:MM format')
];

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ order_id: 1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, validateOrder, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { order_id, value_rs, route_id, delivery_time } = req.body;

    // Check if order_id already exists
    const existingOrder = await Order.findOne({ order_id });
    if (existingOrder) {
      return res.status(400).json({ message: 'Order ID already exists' });
    }

    // Check if route exists
    const routeExists = await Route.findOne({ route_id });
    if (!routeExists) {
      return res.status(400).json({ message: 'Route does not exist' });
    }

    const order = new Order({
      order_id,
      value_rs,
      route_id,
      delivery_time
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Private
router.put('/:id', auth, validateOrder, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { order_id, value_rs, route_id, delivery_time } = req.body;

    // Check if order_id already exists (excluding current order)
    const existingOrder = await Order.findOne({ 
      order_id, 
      _id: { $ne: req.params.id } 
    });
    if (existingOrder) {
      return res.status(400).json({ message: 'Order ID already exists' });
    }

    // Check if route exists
    const routeExists = await Route.findOne({ route_id });
    if (!routeExists) {
      return res.status(400).json({ message: 'Route does not exist' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { order_id, value_rs, route_id, delivery_time },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error while updating order' });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error while deleting order' });
  }
});

module.exports = router;