import { theme } from "../../lib/theme";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid/index.js";
import interactionPlugin from "@fullcalendar/interaction/index.js";
import { Box, type SxProps } from "@mui/material";
import type { EventClickArg, EventSourceInput } from "@fullcalendar/core/index.js";
import type { Theme } from "@emotion/react";
import type { Meeting } from "../../lib/types";

const COLOR_ATTENDEE = "#ff9800";
const COLOR_ATTENDEE_DARK = "#e65100";
const COLOR_ATTENDEE_MISSED = "#edd0a4ff";
const COLOR_ORGANIZER = "#2196f3";
const COLOR_ORGANIZER_DARK = "#0d47a1";
const COLOR_ORGANIZER_MISSED = "#a9c9e3ff";
const COLOR_UNRELATED = "#9e9e9e";
const COLOR_UNRELATED_DARK = "#616161";

/*
  FullCalendar represents each meeting event as an Event Object that has the following properties
  {
    id: number;
    title: string;
    start: Date;
    end: Date;
    className: string[];
    extendedProps?: any
  }

  To avoid bloating the Event object, FullCalendar allows users to store custom data about an
  event in the extendedProps property and will only use the other properties (id, title, start,
  end) in displaying the events

  FullCalendar will use the className property to apply CSS classes to the event when rendering.
    Example:
        if className is set to ["organizer", "accepted"], then the event html element 
        can be styled using the CSS selector .organizer.accepted.
*/
function adaptMeetingData(userID: number, meetingData: Meeting[]): EventSourceInput {
  return meetingData.map((meeting) => {
    let roleClass = "unrelated";

    if (meeting.organizer.userID === userID) {
      roleClass = "organizer";
    } else if (meeting.attendee && meeting.attendee.userID === userID) {
      roleClass = "attendee";
    }

    return {
      title: meeting.task.title,
      start: meeting.start,
      end: meeting.end,
      extendedProps: { ...meeting },
      classNames: [roleClass, meeting.status],
    };
  });
}

export default function Scheduler({
  userID,
  meetingData,
  handleSlotSelect,
  handleEventSelect,
  sx,
}: {
  userID: number;
  meetingData: Meeting[];
  handleSlotSelect: (selectInfo: { start: Date; end: Date; allDay: boolean }) => void;
  handleEventSelect: (arg: EventClickArg) => void;
  sx?: SxProps<Theme> | undefined;
}) {
  return (
    <Box
      sx={{
        padding: "1rem",
        background: "white",
        borderRadius: "8px",
        borderColor: theme.borderSoft,
        borderStyle: "solid",
        borderWidth: "1px",
        boxShadow: theme.shadowSoft,
        flexGrow: 1.5,
        minWidth: "60%",

        ".fc-event": {
          cursor: "pointer",
          border: "none",
          ":hover": { boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)", opacity: 0.95 },
        },

        // Attendee
        ".attendee.pending": {
          backgroundColor: COLOR_ATTENDEE,
          color: theme.textStrong,
        },
        ".attendee.accepted": {
          backgroundColor: COLOR_ATTENDEE_DARK,
          color: "white",
        },
        ".attendee.missed": {
          backgroundColor: COLOR_ATTENDEE_MISSED,
          color: "#5d4037",
        },

        // Organizer
        ".organizer.pending": {
          backgroundColor: COLOR_ORGANIZER,
          color: "white",
        },
        ".organizer.accepted": {
          backgroundColor: COLOR_ORGANIZER_DARK,
          color: "white",
        },
        ".organizer.missed": {
          backgroundColor: COLOR_ORGANIZER_MISSED,
          color: "#0d47a1",
        },

        // Unrelated
        ".unrelated.pending, .unrelated.missed": {
          backgroundColor: COLOR_UNRELATED,
          opacity: 0.7,
          color: "black",
        },
        ".unrelated.accepted": {
          backgroundColor: COLOR_UNRELATED_DARK,
          opacity: 0.8,
          color: "white",
        },
      }}>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        height={"100%"}
        slotMinTime={"09:00:00"}
        slotMaxTime={"19:00:00"}
        eventDisplay="block"
        allDaySlot={false}
        events={adaptMeetingData(userID, meetingData)}
        selectable={true}
        select={handleSlotSelect}
        eventClick={handleEventSelect}
      />
    </Box>
  );
}
