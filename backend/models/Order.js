const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    required: [true, 'Order ID is required'],
    unique: true,
    min: [1, 'Order ID must be positive']
  },
  value_rs: {
    type: Number,
    required: [true, 'Order value is required'],
    min: [1, 'Order value must be at least ₹1']
  },
  route_id: {
    type: Number,
    required: [true, 'Route ID is required'],
    min: [1, 'Route ID must be positive']
  },
  delivery_time: {
    type: String,
    required: [true, 'Delivery time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Delivery time must be in HH:MM format']
  }
}, {
  timestamps: true
});

// Virtual to check if order is high value
orderSchema.virtual('isHighValue').get(function() {
  return this.value_rs > 1000;
});

// Include virtuals when converting to JSON
orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);