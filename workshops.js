const express = require('express');
const router = express.Router();
const Workshop = require('../models/Workshop');

// GET all workshops (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { status, businessUnit, category } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (businessUnit) filter.businessUnit = businessUnit;
    if (category) filter.category = category;

    const workshops = await Workshop.find(filter)
      .populate('registrations')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: workshops.length,
      data: workshops
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single workshop
router.get('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
      .populate('registrations');

    if (!workshop) {
      return res.status(404).json({ success: false, error: 'Workshop not found' });
    }

    res.json({ success: true, data: workshop });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new workshop (admin)
router.post('/', async (req, res) => {
  try {
    const workshop = await Workshop.create(req.body);
    res.status(201).json({ success: true, data: workshop });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update workshop (admin)
router.put('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!workshop) {
      return res.status(404).json({ success: false, error: 'Workshop not found' });
    }

    res.json({ success: true, data: workshop });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE workshop (admin)
router.delete('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);

    if (!workshop) {
      return res.status(404).json({ success: false, error: 'Workshop not found' });
    }

    res.json({ success: true, message: 'Workshop deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET workshop stats (admin dashboard)
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await Workshop.countDocuments();
    const upcoming = await Workshop.countDocuments({ status: 'upcoming' });
    const completed = await Workshop.countDocuments({ status: 'completed' });

    const workshops = await Workshop.find().populate('registrations');
    const totalRegistrations = workshops.reduce((sum, w) => sum + w.registrations.length, 0);
    const avgFillRate = workshops.length > 0
      ? Math.round(workshops.reduce((sum, w) => sum + w.fillPercentage, 0) / workshops.length)
      : 0;

    res.json({
      success: true,
      data: {
        totalWorkshops: total,
        upcoming,
        completed,
        totalRegistrations,
        avgFillRate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
