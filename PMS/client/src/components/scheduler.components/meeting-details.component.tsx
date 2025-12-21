import { Box, Button, Divider, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Edit, Save, Close } from "@mui/icons-material"; // Added icons
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Meeting } from "../../lib/types";

const MeetingDetailsContext = createContext<Meeting | null>(null);

export function MeetingDetails(
    { meetingEvent, children }: {
        meetingEvent: Meeting,
        children?: ReactNode,
    }
) {
    const { project, start, end, organizer, attendee, status } = meetingEvent;

    return <MeetingDetailsContext.Provider value={meetingEvent}>
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>{project.title}</Typography>

            <Stack spacing={1} sx={{ my: 2 }}>
                <Typography variant="body2">
                    Status: <Box component="span"
                        sx={{
                            color: status === "accepted" ? "green" : "red",
                            fontWeight: 'bold'
                        }}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Box>
                </Typography>
                <Typography variant="body2">Organizer: {organizer.name}</Typography>
                <Typography variant="body2">
                    Attendee: {status === "pending" ? "N/A" : attendee.name}
                </Typography>
                <Typography variant="body2">
                    Time: {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
            </Stack>


            {children}
        </Box>
    </MeetingDetailsContext.Provider>
}

MeetingDetails.DescriptionSection = ({
    isMeetingParticipant,
    handleUpdateDescription
}: {
    isMeetingParticipant: boolean,
    handleUpdateDescription: (description: string) => void
}) => {
    const meetingEvent = useContext(MeetingDetailsContext);
    if (!meetingEvent) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [tempDescription, setTempDescription] = useState(meetingEvent.description);
    useEffect(() => {
        setTempDescription(meetingEvent.description);
    }, [meetingEvent.description]);

    const handleSave = () => {
        handleUpdateDescription(tempDescription);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempDescription(meetingEvent.description);
        setIsEditing(false);
    };

    return <>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Description:</Typography>
            {!isEditing && isMeetingParticipant && (
                <IconButton size="small" onClick={() => setIsEditing(true)}>
                    <Edit fontSize="small" />
                </IconButton>
            )}
        </Stack>

        {isEditing && isMeetingParticipant ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    autoFocus
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" color="error" onClick={handleCancel} startIcon={<Close />}>
                        Cancel
                    </Button>
                    <Button size="small" variant="contained" onClick={handleSave} startIcon={<Save />}>
                        Save
                    </Button>
                </Stack>
            </Stack>
        ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {meetingEvent.description || "No description provided."}
            </Typography>
        )
        }
        <Divider sx={{ my: 2 }} />
    </>
};

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