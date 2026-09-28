# Meetings Guide

Schedule and track meetings with clients and team members using Echo11's meeting management system.

## List View

### Date Grouping
Meetings are displayed under date headers for easy scanning:
- **Today** - Meetings happening today
- **Tomorrow** - Meetings happening tomorrow
- **This Week** - Meetings happening this week (excluding today/tomorrow)
- **This Month** - Meetings happening this month (excluding this week)
- **Later** - Meetings happening in future months
- **Past** - Meetings that have already occurred

Each section shows a count of meetings in that time period.

### Meeting Card
Each meeting card displays:
- **Date and time** - Formatted as "Mon, Jan 15 · 2:30 PM"
- **Meeting title** - Clear, descriptive name
- **Duration** - Length in minutes (e.g., "30 min", "1 hr")
- **Project association** - Shows project name if linked (small badge)
- **Video link indicator** - Camera icon if video link is provided
- **Location** - Physical location if provided (optional)
- **Join button** - Appears when video link is present
- **More actions** (⋮) - Edit, delete, or view details

### Create Meeting
Click the "New Meeting" button to open the meeting creation form.

#### Required Fields:
- **Title** (required) - Clear meeting name describing the purpose

#### Optional Fields:
- **Project** - Associated project (optional, for billing and tracking)
- **Date & Time** - When the meeting occurs (date picker + time selector)
- **Duration** - Length in minutes (default: 60, minimum: 15)
- **Video Link** - Zoom/Google Meet/etc. URL for virtual meetings
- **Location** - Physical location for in-person meetings (address or room)
- **Description** - Agenda, notes, or pre-read materials
- **Attendees** - Team members to invite (defaults to organizer)
- **Reminder** - How far before to send notification (15 min, 30 min, 1 hour)
- **Recurring** - Set to repeat (daily, weekly, monthly, custom)

### Meeting Detail (`/lab/meetings/[id]`)
Shows all meeting information with full editing capabilities.

#### Header Section
- Meeting title (editable inline)
- Date and time display
- Status indicators (upcoming, in progress, completed)
- Join Video Call button (prominent when video link provided)
- Edit button (opens edit form)
- Delete button (requires confirmation)
- More actions menu (⋮)

#### Information Tabs

##### Overview
- Full description (agenda, notes, pre-reads)
- Project association (clickable to project detail)
- Video link (clickable to join)
- Location (clickable to open in maps if applicable)
- Organizer and attendees list
- Created and updated timestamps

##### Attendees
- List of all invited participants
- Response status for each (Pending, Accepted, Declined)
- Ability to add/remove attendees
- Change attendee roles (organizer, participant, observer)
- Send/resend invitations
- Mark attendance after meeting

##### Notes
- Collaborative notes area (taken during meeting)
- Action items tracking (assign, set due dates, mark complete)
- Attachments section (relevant files, presentations, recordings)
- Link to related tasks/projects
- Export/share meeting notes option

##### History
- Audit trail of changes (who changed what and when)
- Previous versions of meeting details
- Attendance history for recurring meetings
- Resource usage tracking (if applicable)

### Filters
Available at the top of the meetings list:
- **View:** Upcoming / Past / All (toggle buttons)
- **Project:** Filter by associated project (dropdown, includes "No Project")
- **Search:** By meeting title, description, or location
- **Date Range:** Custom date picker for specific periods
- **Attendee:** Filter by specific team member
- **Has Video:** Show only meetings with video links
- **Location Type:** Virtual vs. In-person

### Keyboard Shortcuts
- `Esc` - Close modals and dropdowns
- Click outside - Close modals and popovers
- `Tab` / `Shift+Tab` - Navigate between form fields
- `Enter` - Submit forms or save changes
- `Cmd+K` / `Ctrl+K` - Open command palette
- `Cmd+Shift+K` - Focus search bar
- `?` - Show keyboard shortcuts overlay

### Best Practices
1. **Set clear agendas** - Use the description field to outline meeting purpose
2. **Invite only needed people** - Reduces meeting fatigue and increases focus
3. **Use video links consistently** - For remote/hybrid team members
4. **Record action items** - Capture decisions and next steps during meetings
5. **Start and end on time** - Respect everyone's schedule
6. **Follow up promptly** - Share notes and action items within 24 hours
7. **Use recurring meetings wisely** - Only for truly regular, necessary meetings
8. **Buffer between meetings** - Allow time for breaks and preparation
9. **Leverage templates** - Create meeting templates for regular meeting types
10. **Track outcomes** - Measure meeting effectiveness through follow-up completion

### Meeting Types
Different meeting types may use different fields:
- **Stand-up** - Short duration (15 min), minimal description, daily
- **Planning** - Longer duration (60+ min), detailed agenda, weekly/bi-weekly
- **Review** - Medium duration (30-45 min), focus on deliverables and feedback
- **Client** - Include client attendees, may have external video links
- **Retrospective** - Focus on process improvement, action-oriented
- **One-on-One** - Private, personal development focused, bi-weekly/monthly