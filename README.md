# Workshop Registration Portal

A full-stack web application for self-service workshop registration with Google Calendar integration, attendance tracking, and multi-business-unit support.

🔗 **[View Interactive Demo →](https://helenacohee.github.io/portfolio/feedback-portal.html)**

---

## The Problem

A learning and development team needed to scale feedback workshops across three business units. The existing process was entirely manual — registration via email, calendar invites created by hand, attendance tracked in spreadsheets, and no visibility into capacity or participation trends.

This meant the program coordinator (me) was spending 5–8 hours per workshop cycle on pure logistics instead of program design.

## The Solution

I built a self-service portal that handles the entire workshop lifecycle:

- **Browse & register** — Employees find upcoming workshops, see real-time capacity, and register themselves
- **Automatic calendar sync** — Google Calendar API sends invites on registration, removes them on cancellation
- **Attendance tracking** — Admin can mark attendance post-session, generating completion data
- **Cross-BU deployment** — Single portal serves three business units with filtered views
- **Reporting** — Export registration and attendance data for stakeholder reviews

**Result:** Reduced administrative overhead from 5–8 hours to ~30 minutes per workshop cycle. Scaled from 1 business unit to 3 without adding headcount.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│         Static HTML/CSS/JS (public/)             │
│    Workshop cards · Registration modals · Admin  │
└───────────────────┬─────────────────────────────┘
                    │ REST API
┌───────────────────┴─────────────────────────────┐
│                Express Server                    │
│  /api/workshops    — CRUD for sessions           │
│  /api/registrations — Register, cancel, attend   │
│  /api/calendar     — Google Calendar sync        │
└──────┬──────────────────────┬────────────────────┘
       │                      │
┌──────┴──────┐    ┌─────────┴──────────┐
│  MongoDB    │    │  Google Calendar   │
│  Atlas      │    │  API               │
│             │    │                    │
│ - Workshops │    │ - Create events    │
│ - Registr.  │    │ - Add attendees    │
│             │    │ - Send invites     │
└─────────────┘    └────────────────────┘
```

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Runtime | Node.js | Fast, lightweight, JS everywhere |
| Framework | Express.js | Minimal, flexible routing |
| Database | MongoDB Atlas | Schema flexibility, free tier for MVP |
| Calendar | Google Calendar API | Org already on Google Workspace |
| Hosting | Render.com | Free tier, auto-deploy from GitHub |
| Frontend | Vanilla HTML/CSS/JS | No build step, instant load |

## API Endpoints

### Workshops
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workshops` | List all workshops (filterable by status, BU, category) |
| GET | `/api/workshops/:id` | Get single workshop with registrations |
| POST | `/api/workshops` | Create workshop (admin) |
| PUT | `/api/workshops/:id` | Update workshop (admin) |
| DELETE | `/api/workshops/:id` | Delete workshop (admin) |
| GET | `/api/workshops/stats/overview` | Dashboard stats |

### Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/registrations` | Register for a workshop |
| GET | `/api/registrations/workshop/:id` | List registrations for a workshop |
| GET | `/api/registrations/user/:email` | List user's registrations |
| PUT | `/api/registrations/:id/cancel` | Cancel registration |
| PUT | `/api/registrations/:id/attendance` | Mark attendance (admin) |
| GET | `/api/registrations/report/attendance` | Attendance report |

### Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/calendar/event` | Create calendar event |
| POST | `/api/calendar/event/:id/attendee` | Add attendee to event |
| DELETE | `/api/calendar/event/:id/attendee/:email` | Remove attendee |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Cloud project with Calendar API enabled (optional — app works without it)

### Setup

```bash
# Clone the repo
git clone https://github.com/HelenaCohee/workshop-portal.git
cd workshop-portal

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and (optionally) Google Calendar credentials

# Seed sample data
node seed.js

# Start the server
npm start
# or for development with auto-reload:
npm run dev
```

Visit `http://localhost:3000` to see the portal.

### Without MongoDB (Demo Mode)

The server will start even without a database connection — it will log a warning and API calls will return errors, but the frontend loads normally with the interactive demo.

## Data Model

### Workshop
```javascript
{
  title: String,           // "Giving Effective Feedback"
  category: String,        // enum: Giving, Receiving, Peer, Leadership
  date: Date,
  startTime: String,       // "10:00"
  endTime: String,         // "11:30"
  location: String,        // "Virtual (Zoom)" or room name
  facilitator: {
    name: String,
    email: String
  },
  businessUnit: String,    // Which BU this serves
  maxCapacity: Number,
  registrations: [ObjectId],  // Refs to Registration docs
  calendarEventId: String,    // Google Calendar event ID
  status: String           // upcoming | in-progress | completed | cancelled
}
```

### Registration
```javascript
{
  workshop: ObjectId,      // Ref to Workshop
  attendee: {
    name: String,
    email: String,
    department: String,
    businessUnit: String
  },
  accommodations: String,  // Dietary/access needs
  calendarInviteSent: Boolean,
  attended: Boolean,       // null until session complete
  status: String           // confirmed | waitlisted | cancelled | no-show
}
```

## What I'd Build Next

If I were continuing to develop this (and I may), the roadmap includes:

1. **Waitlist with auto-promotion** — When someone cancels, auto-register the next person on the waitlist
2. **Recurring workshop templates** — One-click creation of recurring series
3. **Manager visibility** — Let managers see which of their reports are registered
4. **Post-session surveys** — Embedded feedback collection tied to attendance records
5. **Analytics dashboard** — Trend data on participation, NPS, and facilitator ratings over time

## Context

This portal was originally built to support a feedback workshop program across three business units at a Fortune 500 company. The version in this repo is a fully generic, sanitized implementation that demonstrates the architecture and functionality without any proprietary content.

## License

MIT

---

**Built by [Helena Cohee](https://linkedin.com/in/helenabcohee)** — Senior Program Manager | AI Enablement & Operations
