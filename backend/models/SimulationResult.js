const mongoose = require('mongoose');

const simulationResultSchema = new mongoose.Schema({
  total_profit: {
    type: Number,
    required: true
  },
  efficiency_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  on_time_deliveries: {
    type: Number,
    required: true,
    min: 0
  },
  late_deliveries: {
    type: Number,
    required: true,
    min: 0
  },
  fuel_cost_breakdown: {
    base_cost: {
      type: Number,
      required: true
    },
    surcharge: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  simulation_params: {
    available_drivers: Number,
    start_time: String,
    max_hours_per_day: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SimulationResult', simulationResultSchema);