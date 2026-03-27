const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Workshop = require('../models/Workshop');

// POST register for a workshop
router.post('/', async (req, res) => {
  try {
    const { workshopId, name, email, department, businessUnit, accommodations } = req.body;

    // Check workshop exists and has capacity
    const workshop = await Workshop.findById(workshopId).populate('registrations');
    if (!workshop) {
      return res.status(404).json({ success: false, error: 'Workshop not found' });
    }

    if (workshop.isFull) {
      return res.status(400).json({
        success: false,
        error: 'Workshop is full',
        spotsRemaining: 0
      });
    }

    // Check for duplicate registration
    const existing = await Registration.findOne({
      workshop: workshopId,
      'attendee.email': email
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Already registered for this workshop'
      });
    }

    // Create registration
    const registration = await Registration.create({
      workshop: workshopId,
      attendee: { name, email, department, businessUnit },
      accommodations: accommodations || ''
    });

    // Add registration to workshop
    workshop.registrations.push(registration._id);
    await workshop.save();

    res.status(201).json({
      success: true,
      data: registration,
      message: `Successfully registered for "${workshop.title}"`,
      spotsRemaining: workshop.maxCapacity - workshop.registrations.length
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Already registered for this workshop'
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET registrations for a workshop
router.get('/workshop/:workshopId', async (req, res) => {
  try {
    const registrations = await Registration.find({
      workshop: req.params.workshopId
    }).sort({ registeredAt: -1 });

    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET registrations for a user (by email)
router.get('/user/:email', async (req, res) => {
  try {
    const registrations = await Registration.find({
      'attendee.email': req.params.email
    }).populate('workshop').sort({ registeredAt: -1 });

    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT cancel registration
router.put('/:id/cancel', async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancelledAt: new Date() },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    // Remove from workshop registrations array
    await Workshop.findByIdAndUpdate(registration.workshop, {
      $pull: { registrations: registration._id }
    });

    res.json({ success: true, data: registration, message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT mark attendance (admin)
router.put('/:id/attendance', async (req, res) => {
  try {
    const { attended } = req.body;
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { attended },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    res.json({ success: true, data: registration });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET attendance report (admin)
router.get('/report/attendance', async (req, res) => {
  try {
    const { startDate, endDate, businessUnit } = req.query;
    const filter = {};

    if (businessUnit) filter['attendee.businessUnit'] = businessUnit;

    const registrations = await Registration.find(filter)
      .populate('workshop')
      .sort({ registeredAt: -1 });

    const total = registrations.length;
    const attended = registrations.filter(r => r.attended === true).length;
    const noShow = registrations.filter(r => r.attended === false).length;
    const cancelled = registrations.filter(r => r.status === 'cancelled').length;
    const attendanceRate = total > 0 ? Math.round((attended / (total - cancelled)) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        attended,
        noShow,
        cancelled,
        attendanceRate: `${attendanceRate}%`,
        registrations
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
