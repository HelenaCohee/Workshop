const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

// Initialize Google Calendar client
function getCalendarClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  return google.calendar({ version: 'v3', auth });
}

// POST create calendar event for a workshop
router.post('/event', async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, location, attendeeEmails } = req.body;

    const calendar = getCalendarClient();
    const event = {
      summary: `Workshop: ${title}`,
      description: description || `You're registered for ${title}`,
      location: location,
      start: {
        dateTime: `${date}T${startTime}:00`,
        timeZone: 'America/Los_Angeles'
      },
      end: {
        dateTime: `${date}T${endTime}:00`,
        timeZone: 'America/Los_Angeles'
      },
      attendees: attendeeEmails.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },  // 1 day before
          { method: 'popup', minutes: 30 }          // 30 min before
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      resource: event,
      sendUpdates: 'all'  // Send email invites to attendees
    });

    res.json({
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      message: 'Calendar event created and invites sent'
    });
  } catch (err) {
    console.error('Calendar API error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create calendar event',
      details: err.message
    });
  }
});

// POST add single attendee to existing event
router.post('/event/:eventId/attendee', async (req, res) => {
  try {
    const { email } = req.body;
    const calendar = getCalendarClient();

    // Get existing event
    const existing = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: req.params.eventId
    });

    // Add new attendee
    const attendees = existing.data.attendees || [];
    attendees.push({ email });

    const response = await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: req.params.eventId,
      resource: { attendees },
      sendUpdates: 'all'
    });

    res.json({
      success: true,
      message: `Calendar invite sent to ${email}`,
      eventId: response.data.id
    });
  } catch (err) {
    console.error('Calendar API error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE remove attendee from event (for cancellations)
router.delete('/event/:eventId/attendee/:email', async (req, res) => {
  try {
    const calendar = getCalendarClient();

    const existing = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: req.params.eventId
    });

    const attendees = (existing.data.attendees || [])
      .filter(a => a.email !== req.params.email);

    await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: req.params.eventId,
      resource: { attendees },
      sendUpdates: 'all'
    });

    res.json({ success: true, message: 'Attendee removed from calendar event' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
