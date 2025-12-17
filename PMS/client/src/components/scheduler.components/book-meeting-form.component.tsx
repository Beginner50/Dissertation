import { Box, Button, Stack, TextField } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

type MeetingFormData = {
    title: string,
    description: string,
    startTime: string,
    endTime: string,
    attendeeID: number
};
export function BookMeetingForm(
    { slot, handleBookMeeting }: {
        slot: {
            start: Date,
            end: Date
        } | null,
        handleBookMeeting: (meetingData: {
            title: string,
            description: string,
            start: Date,
            end: Date,
            attendeeID: number
        }) => void
    }) {
    /*  Slot's start and end contain the date and time as well
    
        The form below will only need to work with the time part of the full date.  
    */

    // (Re-)Initialize when slot changes
    const [formData, setFormData] = useState<MeetingFormData>({
        title: "",
        description: "",
        startTime: slot?.start.toTimeString().slice(0, 5) ?? "",
        endTime: slot?.end.toTimeString().slice(0, 5) ?? "",
        attendeeID: NaN
    });
    useEffect(() => {
        setFormData({
            title: "",
            description: "",
            startTime: slot?.start.toTimeString().slice(0, 5) ?? "",
            endTime: slot?.end.toTimeString().slice(0, 5) ?? "",
            attendeeID: NaN
        })
    }, [slot])


    // Pre-processing is done to recombine the date and the time from start and end
    const onBookMeetingClick = useCallback(() => {
        if (slot) {
            let startDate = slot.start;
            let endDate = slot.end;

            startDate.setHours(parseInt(formData.startTime.slice(0, 2)),
                parseInt(formData.startTime.slice(3, 5)));
            endDate.setHours(parseInt(formData.endTime.slice(0, 2)),
                parseInt(formData.endTime.slice(3, 5)));

            if (startDate >= endDate) {
                alert('End time must be after the start time.');
                return;
            }

            handleBookMeeting({
                title: formData.title,
                start: startDate,
                end: endDate,
                description: formData.description,
                attendeeID: formData.attendeeID,
            });
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
        console.log("Form invalid: ", a);
        return a;
    }, [formData])

    return <Stack spacing={2}>
        <TextField
            label="Meeting Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            fullWidth
            required
            size="small"
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

        <Box display="flex" gap={2}>
            <TextField
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
                fullWidth
                size="small"
            />
            <TextField
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
                fullWidth
                size="small"
            />
        </Box>

        <TextField
            label="Attendee ID"
            type="number"
            value={formData.attendeeID}
            onChange={(e) => setFormData(prev => ({ ...prev, attendeeID: Number.parseInt(e.target.value) }))}
            fullWidth
            required
            size="small"
        />

        <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={onBookMeetingClick}
            disabled={isFormInvalid}>
            Book Meeting
        </Button>
    </Stack>
}