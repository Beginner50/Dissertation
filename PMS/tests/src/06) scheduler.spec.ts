/*
  FR17/FR18/FR19/FR20
  J. The system shall provide a shared calendar for students to view their supervisor's existing meeting
     schedule. The system shall enable users to book, cancel, or RSVP (Accept/Reject) to meetings, with
     a color-coded calendar reflecting the invitation state (e.g., Accepted, Pending). Students shall be
     restricted to booking meeting appointments exclusively with their assigned supervisor.
    J.1. Create Meetings
      J.1.1. Successful Meeting Booking
      J.1.2. Booking Disabled (Incomplete Form)
      J.1.3. Unsuccesful Meeting Booking (Supervisor-Student not respected)
      J.1.4. Unsuccesful Meeting Booking (Meeting Date < Current Date)
    
    J.2. Cancel Meetings
      J.2.1. Unsuccessful Meeting Cancellation (User Not Meeting Member)
      J.2.2. Unsuccessful Meeting Cancellation (User Not Meeting Organizer)
      J.2.3. Unsuccessful Meeting Cancellation (Missed Meeting)
      J.2.4. Successful Meeting Cancellation (Pending Meeting)
    
    J.3. Accept Meetings
      J.2.1. Unsuccessful Meeting Acceptance (User Not Meeting Member)
      J.2.2. Unsuccessful Meeting Acceptance (User Not Meeting Attendee)
      J.2.3. Unsuccessful Meeting Acceptance (Missed Meeting)
      J.2.4. Successful Meeting Acceptance (Pending Meeting)

    J.4. Reject Meetings
      J.3.1. Unsuccessful Meeting Reject (User Not Meeting Member)
      J.3.2. Unsuccessful Meeting Reject (User Not Meeting Attendee)
      J.3.3. Unsuccessful Meeting Reject (Missed Meeting)
      J.3.4. Successful Meeting Reject (Pending Meeting)
*/
