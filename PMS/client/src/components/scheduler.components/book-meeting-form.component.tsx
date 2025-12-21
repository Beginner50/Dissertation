import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { MeetingFormData } from "../../lib/types";

const MeetingFormContext = createContext<
    { formData: MeetingFormData } &
    { setFormData: Dispatch<SetStateAction<MeetingFormData>> }
    | null>(null);

export function BookMeetingForm(
    { start, end, children }: {
        start: Date,
        end: Date,
        children?: ReactNode
    }) {
    // (Re-)Initialize when start and end time changes
    const [formData, setFormData] = useState<MeetingFormData>({
        description: "",
        start: start,
        end: end,
        attendeeID: 0,
        projectID: 0,
        projectTitle: ""
    });
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            start: start,
            end: end,
        }))
    }, [start, end])


    return <MeetingFormContext.Provider value={{ formData, setFormData }}>
        <Stack sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: "1rem",
        }}>
            <TextField
                label="Title"
                value={formData.projectTitle}
                disabled
                fullWidth
                multiline
            />

            <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                size="small"
            />

            <Box display="flex" sx={{ gap: "0.2rem", flexGrow: 1 }}>
                <TextField
                    label="Start Time"
                    type="time"
                    value={formData.start.toTimeString().slice(0, 5) ?? ""}
                    onChange={(e) => setFormData(prev => {
                        let start = prev.start;
                        const [hourHand, minuteHand] =
                            [parseInt(e.target.value.slice(0, 2)),
                            parseInt(e.target.value.slice(3, 5))]

                        start.setHours(hourHand, minuteHand);
                        return { ...prev, start: start }
                    })}
                    required
                    fullWidth
                    size="small"
                />
                <TextField
                    label="End Time"
                    type="time"
                    value={formData.end.toTimeString().slice(0, 5) ?? ""}
                    onChange={(e) => setFormData(prev => {
                        let end = prev.end;
                        const [hourHand, minuteHand] =
                            [parseInt(e.target.value.slice(0, 2)),
                            parseInt(e.target.value.slice(3, 5))]

                        end.setHours(hourHand, minuteHand);
                        return { ...prev, end: end }
                    })}
                    required
                    fullWidth
                    size="small"
                />
            </Box>

            {children}
        </Stack>
    </MeetingFormContext.Provider >
}

BookMeetingForm.AttendeeSelect = ({ otherMeetingUsers }: {
    otherMeetingUsers:
    {
        userID: number,
        name: string,
        projectID: number | null
        projectTitle: string
    }[],
}) => {
    const context = useContext(MeetingFormContext);
    if (!context) return null;
    const { formData } = context;

    useEffect(() => {
        context.setFormData(prev => ({
            ...prev,
            attendeeID: otherMeetingUsers[0]?.userID ?? 0,
            projectID: otherMeetingUsers[0]?.projectID ?? 0,
            projectTitle: otherMeetingUsers[0]?.projectTitle ?? ""
        }));
    }, []);

    const handleChange = (userID: number) => {
        const selectedUser = otherMeetingUsers.find(u => u.userID === userID);
        if (selectedUser) {
            context.setFormData(prev => ({
                ...prev,
                attendeeID: selectedUser.userID,
                projectID: selectedUser.projectID ?? 0,
                projectTitle: selectedUser.projectTitle
            }));
        }
    };

    return (
        <FormControl fullWidth size="small">
            <InputLabel id="attendee-select-label">Select Attendee</InputLabel>
            <Select
                labelId="attendee-select-label"
                value={formData.attendeeID ?? ""}
                label="Select Attendee"
                onChange={(e) => handleChange(e.target.value as number)}
            >
                {otherMeetingUsers.map((user) => (
                    <MenuItem key={user.userID} value={user.userID}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography variant="body2">{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">ID: {user.userID}</Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

BookMeetingForm.SubmitButton = ({
    handleBookMeeting
}: {
    handleBookMeeting: (meetingData: MeetingFormData) => void
}) => {
    const context = useContext(MeetingFormContext);
    if (!context) return null;
    const { formData } = context;

    // Pre-processing is done to recombine the date and the time from start and end
    const onBookMeetingClick = useCallback(() => {
        if (formData?.start && formData?.end) {
            const newMeeting: MeetingFormData = {
                description: formData.description,
                start: formData.start,
                end: formData.end,
                attendeeID: formData.attendeeID,
                projectID: formData.projectID,
                projectTitle: formData.projectTitle
            }

            handleBookMeeting(newMeeting);
        }
    }, [formData])

    const isFormInvalid = useMemo(() => {
        const a = Object.entries(formData).some(([key, val]) => {
            if (typeof val == "number")
                return Number.isNaN(val);
            else if (key != "description")
                return val == "";
            return false;
        })
        return a;
    }, [formData])


    return <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={onBookMeetingClick}
        disabled={isFormInvalid}>
        Book Meeting
    </Button>
}