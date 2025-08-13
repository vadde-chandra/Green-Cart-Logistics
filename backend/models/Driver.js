const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  shift_hours: {
    type: Number,
    required: [true, 'Shift hours is required'],
    min: [1, 'Shift hours must be at least 1'],
    max: [24, 'Shift hours cannot exceed 24']
  },
  past_week_hours: {
    type: [Number],
    required: [true, 'Past week hours is required'],
    validate: {
      validator: function(arr) {
        return arr.length === 7 && arr.every(hours => hours >= 0 && hours <= 24);
      },
      message: 'Past week hours must be an array of 7 numbers between 0 and 24'
    }
  }
}, {
  timestamps: true
});

// Virtual for average hours per day
driverSchema.virtual('averageHoursPerDay').get(function() {
  return this.past_week_hours.reduce((sum, hours) => sum + hours, 0) / 7;
});

// Virtual for total hours last week
driverSchema.virtual('totalHoursLastWeek').get(function() {
  return this.past_week_hours.reduce((sum, hours) => sum + hours, 0);
});

// Include virtuals when converting to JSON
driverSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Driver', driverSchema);