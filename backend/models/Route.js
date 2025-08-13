const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  route_id: {
    type: Number,
    required: [true, 'Route ID is required'],
    unique: true,
    min: [1, 'Route ID must be positive']
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0.1, 'Distance must be at least 0.1 km']
  },
  traffic_level: {
    type: String,
    required: [true, 'Traffic level is required'],
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Traffic level must be Low, Medium, or High'
    }
  },
  base_time: {
    type: Number,
    required: [true, 'Base time is required'],
    min: [1, 'Base time must be at least 1 minute']
  }
}, {
  timestamps: true
});

// Virtual for fuel cost calculation
routeSchema.virtual('fuelCost').get(function() {
  const baseCost = this.distance * 5; // ₹5/km base cost
  const surcharge = this.traffic_level === 'High' ? this.distance * 2 : 0; // ₹2/km surcharge for high traffic
  return {
    base: baseCost,
    surcharge: surcharge,
    total: baseCost + surcharge
  };
});

// Include virtuals when converting to JSON
routeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Route', routeSchema);