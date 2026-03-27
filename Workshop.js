const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Giving Feedback', 'Receiving Feedback', 'Peer Feedback', 'Leadership Feedback']
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  facilitator: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  businessUnit: {
    type: String,
    required: true
  },
  maxCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  registrations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  }],
  calendarEventId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['upcoming', 'in-progress', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual: spots remaining
workshopSchema.virtual('spotsRemaining').get(function() {
  return this.maxCapacity - this.registrations.length;
});

// Virtual: is full
workshopSchema.virtual('isFull').get(function() {
  return this.registrations.length >= this.maxCapacity;
});

// Virtual: fill percentage
workshopSchema.virtual('fillPercentage').get(function() {
  return Math.round((this.registrations.length / this.maxCapacity) * 100);
});

module.exports = mongoose.model('Workshop', workshopSchema);
