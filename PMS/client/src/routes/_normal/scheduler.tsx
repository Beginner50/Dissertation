import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router'
import type { EventClickArg } from '@fullcalendar/core/index.js'
import type { User } from '@/lib/types'
import Scheduler from '@/components/scheduler.components/scheduler.component';
import SchedulerActions from '@/components/scheduler.components/scheduler-actions.component';
import { BookMeetingForm } from '@/components/scheduler.components/book-meeting-form.component';
import { MeetingDetails } from '@/components/scheduler.components/meeting-details.component';
import { Typography } from '@mui/material';

export interface Meeting {
  title: string;
  start: Date;
  end: Date;
  description: string;
  organizer: { id: number, name: string, email: string };
  attendee: { id: number, name: string, email: string };
  status: "accepted" | "pending"
}

const unrelatedUser: Omit<User, "projectIDs"> = {
  id: 1,
  name: 'Jimbo',
  email: 'jimbo@gmail.com',
}
const otherUser: Omit<User, "projectIDs"> = {
  id: 2,
  name: 'Bob',
  email: 'bob@email.com',
}
const mockUser: Omit<User, "projectIDs"> = {
  id: 3,
  name: 'James',
  email: 'james@gmail.com',
}

const meetings: Meeting[] = [
  {
    title: "Marketing Strategy", start: new Date(2025, 11, 15, 8, 30, 0), end: new Date(2025, 11, 15, 9, 30, 0), description: "Review Q1 campaigns and budget allocations.",
    organizer: unrelatedUser, attendee: otherUser, status: "pending",
  },
  {
    title: "Client Check-in (Pending)", start: new Date(2025, 11, 16, 14, 0, 0), end: new Date(2025, 11, 16, 15, 0, 0), description: "Discuss deliverables for Phase 2.",
    organizer: otherUser, attendee: mockUser, status: "pending",
  },
  {
    title: "Client Check-in (Accepted)", start: new Date(2025, 11, 16, 16, 0, 0), end: new Date(2025, 11, 16, 17, 0, 0), description: "Follow up on previous feedback session.",
    organizer: otherUser, attendee: mockUser, status: "accepted",
  },
  {
    title: "Design Handoff", start: new Date(2025, 11, 17, 11, 0, 0), end: new Date(2025, 11, 17, 12, 0, 0), description: "Review and transfer final mockups to development team.",
    organizer: otherUser, attendee: mockUser, status: "accepted",
  },
  {
    title: "Team Offsite Prep", start: new Date(2025, 11, 18, 9, 0, 0), end: new Date(2025, 11, 18, 10, 30, 0), description: "Finalize logistics and agenda for company offsite.",
    organizer: mockUser, attendee: otherUser, status: "pending",
  },
  {
    title: "Board Meeting (Accepted)", start: new Date(2025, 11, 19, 11, 0, 0), end: new Date(2025, 11, 19, 12, 0, 0), description: "Quarterly review of company performance.",
    organizer: mockUser, attendee: otherUser, status: "accepted",
  },
  {
    title: "Company Holiday Party Planning", start: new Date(2025, 11, 19, 14, 0, 0), end: new Date(2025, 11, 19, 15, 0, 0), description: "Final menu and vendor confirmation.",
    organizer: unrelatedUser, attendee: otherUser, status: "accepted",
  },
];

export const Route = createFileRoute('/_normal/scheduler')({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentMeetings, setCurrentMeetings] = useState(meetings);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);



  const handleSlotSelect = (slot: { start: Date; end: Date; }) => {
    setSelectedMeeting(null);
    setSelectedSlot({ start: slot.start, end: slot.end });
  };

  const handleEventSelect = (arg: EventClickArg) => {
    setSelectedSlot(null);
    const fullMeeting = arg.event.extendedProps as unknown as Meeting;
    setSelectedMeeting(fullMeeting);
  };

  const handleBookMeeting = (newMeetingData: {
    title: string,
    description: string,
    start: Date,
    end: Date,
    attendeeID: number
  }) => {
    // const newMeeting: Meeting = {
    //   ...newMeetingData,
    //   organizer: mockUser,
    //   attendee: targetAttendee,
    //   status: "pending",
    // };

    // setCurrentMeetings(prev => [...prev, newMeeting]);
    setSelectedSlot(null);
    alert(`Meeting booked successfully!`);
  };

  const handleCancelMeeting = () => {
    alert(`Organizer: Cancelling meeting "${selectedMeeting?.title}"`);
    // Logic to update state/API to cancel
  };

  const handleAcceptMeeting = () => {
    alert(`Attendee: Accepting meeting "${selectedMeeting?.title}"`);
    // Logic to update state/API to set status to 'accepted'
  };

  const handleRejectMeeting = () => {
    alert(`Attendee: Rejecting meeting "${selectedMeeting?.title}"`);
    // Logic to update state/API to set status to 'rejected' (or null attendee)
  };

  const handlePostponeMeeting = () => {
    alert(`Attendee: Postponing meeting "${selectedMeeting?.title}"`);
    // Logic to open a reschedule modal
  };

  return (
    <>
      <Scheduler
        userID={mockUser.id}
        meetingData={currentMeetings}
        handleSlotSelect={handleSlotSelect}
        handleEventSelect={handleEventSelect}
      />

      <SchedulerActions>
        <SchedulerActions.Header title={selectedSlot ? "Book Meeting" : "Event Details"} />
        { /* If an empty slot has been selected, show BookMeetingForm */
          selectedSlot ?
            <BookMeetingForm
              slot={selectedSlot}
              handleBookMeeting={handleBookMeeting}
            />
            /* If a meeting has been selected, show the details*/
            : selectedMeeting ?
              <MeetingDetails meetingEvent={selectedMeeting} >
                { /* Show the cancel button if user is the organizer */
                  selectedMeeting.organizer.id === mockUser.id ?
                    <SchedulerActions.CancelMeeting
                      handleCancel={handleCancelMeeting} />
                    /* If the user is the attendee, and has not accepted the meeting*/
                    : selectedMeeting.attendee.id === mockUser.id
                    && selectedMeeting.status === "pending" &&
                    <SchedulerActions.AttendeeMeetingButtons
                      handleAccept={handleAcceptMeeting}
                      handlePostpone={handlePostponeMeeting}
                      handleReject={handleRejectMeeting}
                    />}
                <MeetingDetails.MeetingStatus
                  isMeetingParticipant={selectedMeeting.attendee.id === mockUser.id}
                  status={selectedMeeting.status} />
              </MeetingDetails>
              : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }} >
                Click an event on the calendar to see details and actions.
              </Typography>
        }

      </SchedulerActions>
    </>
  )
}