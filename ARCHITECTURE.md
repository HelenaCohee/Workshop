# Architecture & Design Decisions

## Why Build Instead of Buy?

The team evaluated several existing tools (Eventbrite, Calendly, LMS registration modules) and none met the requirements:

1. **Cross-BU visibility** — Needed a single portal serving multiple business units with shared and filtered views
2. **Calendar integration** — Required automatic Google Calendar invites (the org runs on Google Workspace)
3. **Attendance tracking** — Needed post-session attendance data that feeds into program reporting
4. **No per-seat licensing** — SaaS tools charge per user; this tool needed to be free for all employees
5. **Customizable workflows** — Off-the-shelf tools couldn't match the registration → calendar → attendance → reporting flow

Build time was approximately 2 weeks for MVP, with ongoing refinement. Total vendor cost avoided: estimated $75K–$120K for equivalent custom development.

## Key Design Decisions

### Node.js + Express (not Python/Django, not a SaaS builder)
The org's existing tools (Google Apps Script, internal APIs) are JavaScript-based. Using Node.js meant I could leverage existing knowledge and share patterns across tools. Express is minimal — no magic, easy to debug, fast to prototype.

### MongoDB Atlas (not PostgreSQL, not Airtable)
Schema flexibility was critical during early iterations. Workshop structures changed multiple times as the program evolved. MongoDB's document model let me add fields without migrations. Atlas free tier kept costs at zero.

### Vanilla frontend (not React, not Vue)
The audience is employees registering for workshops — they don't need a single-page app. Static HTML with vanilla JS loads instantly, requires no build step, and is trivially deployable. The tradeoff is less code organization at scale, but for this scope it's the right call.

### Google Calendar API (not email-only)
Initial version just sent confirmation emails. But employees wanted calendar blocks, and facilitators needed a single view of all sessions. Google Calendar API solved both — one integration, automatic invites, automatic removal on cancellation.

### Render.com (not AWS, not Heroku)
Free tier with auto-deploy from GitHub. Zero DevOps overhead. The app doesn't need load balancing or complex infrastructure — it serves a few hundred users per quarter with predictable traffic patterns (spikes around new workshop announcements, quiet otherwise).

## Security Considerations

- MongoDB Atlas handles encryption at rest
- Environment variables for all secrets (never committed to repo)
- Session-based auth (expandable to SSO integration)
- Input validation on all API endpoints
- Duplicate registration prevention at the database level (compound unique index)

## Scalability

Current architecture supports the program's scale (~250 registrations/quarter). If needed to scale significantly:

1. Add Redis for session storage (currently in-memory)
2. Add rate limiting on registration endpoints
3. Move to a queue-based calendar sync (currently synchronous)
4. Add CDN for static assets

None of these are needed at current volume, and premature optimization would add complexity without value.
