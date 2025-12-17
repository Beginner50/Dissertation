import { Box, Divider, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function MeetingDetails(
    { meetingEvent:
        { title, organizer, attendee, description, start, end, status },
        children
    }: {
        meetingEvent: {
            title: string,
            organizer: { name: string },
            attendee: { name: string }
            description: string,
            start: Date,
            end: Date,
            status: string
        },
        children?: ReactNode
    }
) {
    return <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>

        <Stack spacing={1} sx={{ my: 2 }}>
            <Typography variant="body2">
                Status: <Box component="span"
                    sx={{
                        color:
                            status === "accepted" ? "green" : "red", fontWeight: 'bold'
                    }}>{status.toUpperCase()[0] + status.slice(1, status.length)}</Box>
            </Typography>
            <Typography variant="body2">
                Organized By: {organizer.name}
            </Typography>
            <Typography variant="body2">
                Attendee: {status === "pending" ? "N/A" : attendee.name}
            </Typography>
            <Typography variant="body2">
                Time: {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Description:</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>

        <Divider sx={{ my: 2 }} />

        {children}
    </Box>
}

MeetingDetails.MeetingStatus = ({ isMeetingParticipant, status }:
    { isMeetingParticipant: boolean, status: string }) => {
    if (isMeetingParticipant && status === "accepted")
        return (<Typography variant="body2" color="success.main" sx={{ p: 1, fontWeight: 'bold' }}>
            You have accepted this meeting.
        </Typography>);
    else if (!isMeetingParticipant)
        return (<Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
            No actions available (Unrelated event).
        </Typography>);
    return <></>
}