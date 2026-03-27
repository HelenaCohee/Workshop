/**
 * Seed script — populates the database with sample workshops
 * Run: node seed.js
 * Requires MONGODB_URI in .env
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Workshop = require('./models/Workshop');

const sampleWorkshops = [
  {
    title: 'Giving Effective Feedback',
    category: 'Giving Feedback',
    description: 'Learn frameworks for delivering clear, constructive feedback that drives growth.',
    date: new Date('2026-04-08'),
    startTime: '10:00',
    endTime: '11:30',
    location: 'Virtual (Zoom)',
    facilitator: { name: 'Sarah Chen', email: 'schen@company.com' },
    businessUnit: 'Acme Studios',
    maxCapacity: 20,
    status: 'upcoming'
  },
  {
    title: 'Receiving Feedback with Grace',
    category: 'Receiving Feedback',
    description: 'Develop skills to process and act on feedback without defensiveness.',
    date: new Date('2026-04-12'),
    startTime: '14:00',
    endTime: '15:30',
    location: 'Virtual (Zoom)',
    facilitator: { name: 'Marcus Rivera', email: 'mrivera@company.com' },
    businessUnit: 'Acme Animation',
    maxCapacity: 25,
    status: 'upcoming'
  },
  {
    title: 'Peer-to-Peer Feedback Lab',
    category: 'Peer Feedback',
    description: 'Practice giving and receiving feedback with peers in a low-stakes environment.',
    date: new Date('2026-04-15'),
    startTime: '11:00',
    endTime: '12:30',
    location: 'Room 4B, Building 2',
    facilitator: { name: 'Jordan Lee', email: 'jlee@company.com' },
    businessUnit: 'Acme Studios',
    maxCapacity: 15,
    status: 'upcoming'
  },
  {
    title: 'Feedback for New Managers',
    category: 'Leadership Feedback',
    description: 'Specialized session for first-time managers navigating feedback conversations.',
    date: new Date('2026-04-18'),
    startTime: '13:00',
    endTime: '14:30',
    location: 'Virtual (Zoom)',
    facilitator: { name: 'Priya Patel', email: 'ppatel@company.com' },
    businessUnit: 'Horizon Studios',
    maxCapacity: 20,
    status: 'upcoming'
  },
  {
    title: 'Navigating Difficult Conversations',
    category: 'Giving Feedback',
    description: 'Strategies for addressing performance issues and sensitive topics.',
    date: new Date('2026-04-22'),
    startTime: '10:00',
    endTime: '11:30',
    location: 'Virtual (Zoom)',
    facilitator: { name: 'Sarah Chen', email: 'schen@company.com' },
    businessUnit: 'Acme Studios',
    maxCapacity: 20,
    status: 'upcoming'
  },
  {
    title: 'Building a Feedback Culture',
    category: 'Leadership Feedback',
    description: 'For leaders who want to embed feedback into their team\'s operating rhythm.',
    date: new Date('2026-04-25'),
    startTime: '15:00',
    endTime: '16:30',
    location: 'Room 2A, Building 1',
    facilitator: { name: 'Marcus Rivera', email: 'mrivera@company.com' },
    businessUnit: 'Acme Animation',
    maxCapacity: 18,
    status: 'upcoming'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workshop-portal');
    console.log('Connected to MongoDB');

    await Workshop.deleteMany({});
    console.log('Cleared existing workshops');

    const created = await Workshop.insertMany(sampleWorkshops);
    console.log(`Seeded ${created.length} workshops`);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
