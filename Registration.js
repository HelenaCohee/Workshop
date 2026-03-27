const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    required: true
  },
  attendee: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    businessUnit: { type: String, required: true }
  },
  accommodations: {
    type: String,
    default: ''
  },
  calendarInviteSent: {
    type: Boolean,
    default: false
  },
  attended: {
    type: Boolean,
    default: null  // null = not yet determined, true/false after session
  },
  status: {
    type: String,
    enum: ['confirmed', 'waitlisted', 'cancelled', 'no-show'],
    default: 'confirmed'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Prevent duplicate registrations
registrationSchema.index({ workshop: 1, 'attendee.email': 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
