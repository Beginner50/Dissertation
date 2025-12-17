import { theme } from "@/lib/theme";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Box } from "@mui/material";
import type { EventClickArg } from "@fullcalendar/core/index.js";

const COLOR_ATTENDEE = '#ff9800';
const COLOR_ATTENDEE_DARK = '#e65100';
const COLOR_ORGANIZER = '#2196f3';
const COLOR_ORGANIZER_DARK = '#0d47a1';
const COLOR_UNRELATED = '#9e9e9e';
const COLOR_UNRELATED_DARK = '#616161';

type MeetingData = {
    title: string, start: Date, end: Date, description: string,
    organizer: { id: number, name: string, email: string },
    attendee: { id: number, name: string, email: string },
    status: "pending" | "accepted"
};

function adaptMeetingData(userID: number, meetingData: MeetingData[]) {
    return meetingData.map(meeting => {
        let roleClass = 'unrelated';

        if (meeting.organizer.id === userID) {
            roleClass = 'organizer';
        } else if (meeting.attendee && meeting.attendee.id === userID) {
            roleClass = 'attendee';
        }

        const typeClass = meeting.title.includes('Design Handoff') ? 'event-type-file' : '';

        return {
            ...meeting,
            extendedProps: {
                ...meeting,
            },
            classNames: [
                roleClass,
                meeting.status,
                typeClass
            ].filter(c => c)
        }
    });
}

export default function Scheduler(
    { userID, meetingData, handleSlotSelect, handleEventSelect }:
        {
            userID: number,
            meetingData: MeetingData[],
            handleSlotSelect: (selectInfo: { start: Date; end: Date; allDay: boolean; }) => void,
            handleEventSelect: (arg: EventClickArg) => void
        }) {

    return (
        <Box sx={{
            padding: "1rem",
            background: "white",
            borderRadius: "8px",
            borderColor: theme.borderSoft,
            borderStyle: "solid",
            borderWidth: "1px",
            boxShadow: theme.shadowSoft,
            flexGrow: 1.5,
            minWidth: '60%',

            '.fc-event': { cursor: 'pointer', border: 'none', '&:hover': { boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)', opacity: 0.95, } },
            '.fc-timegrid-event.attendee.pending': { backgroundColor: COLOR_ATTENDEE, color: theme.textStrong, },
            '.fc-timegrid-event.attendee.accepted': { backgroundColor: COLOR_ATTENDEE_DARK, color: 'white', },
            ".fc-timegrid-event.organizer.pending": { backgroundColor: COLOR_ORGANIZER, color: 'white', },
            ".fc-timegrid-event.organizer.accepted": { backgroundColor: COLOR_ORGANIZER_DARK, color: 'white', },
            ".fc-timegrid-event.unrelated.pending": { backgroundColor: COLOR_UNRELATED, opacity: 0.7, color: 'black', },
            ".fc-timegrid-event.unrelated.accepted": { backgroundColor: COLOR_UNRELATED_DARK, opacity: 0.8, color: 'white', },
        }}>
            <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView='timeGridWeek'
                height={"100%"}
                slotMinTime={"08:00:00"}
                slotMaxTime={"19:00:00"}
                eventDisplay='block'
                allDaySlot={false}
                events={adaptMeetingData(userID, meetingData)}
                selectable={true}
                select={handleSlotSelect}
                eventClick={handleEventSelect}
            />
        </Box >
    )
}