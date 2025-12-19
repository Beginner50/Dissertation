import { useMemo, useState } from 'react';
import type { EventClickArg } from '@fullcalendar/core/index.js'
import Scheduler from '../../components/scheduler.components/scheduler.component';
import SchedulerActions from '../../components/scheduler.components/scheduler-actions.component';
import { BookMeetingForm } from '../../components/scheduler.components/book-meeting-form.component';
import { MeetingDetails } from '../../components/scheduler.components/meeting-details.component';
import { Divider, Typography } from '@mui/material';
import type { Meeting, MeetingFormData, User } from '../../lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';

let userID = 1;
let userProjects = [{ projectID: 1, title: "Sample Project" }];
const origin = window.location.origin.replace(/3000/, '5081');


export default function SchedulerRoute() {
    const queryClient = useQueryClient();
    const meetingMutation = useMutation({
        mutationFn: async ({ url, data }: { url: string, data: any }) => {
            const response =
                await ky.post(url, { json: data });
            return response;
        },
        onSuccess: () => {
            console.log("Invalidating meetings query");
            queryClient.invalidateQueries({ queryKey: ['meetings'], refetchType: 'all', exact: true });
        },
        onError: (error) => {
            console.error("Meeting mutation error:", error);
        }
    });

    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

    // Get meetings from API
    const { data: meetingEvents, isLoading } = useQuery({
        queryKey: ['meetings'],
        queryFn: async () => {
            const response = await ky.get(`${origin}/api/users/${userID}/meetings`);
            if (!response.ok)
                throw new Error('Failed to fetch meeting events');

            const meetingEvents = (await response.json()) as Record<string, any>[];
            console.log("Fetched meetings:", meetingEvents);
            return meetingEvents.map(m => ({
                ...m,
                start: new Date(m.start),
                end: new Date(m.end),
                status: m.status.toLowerCase()
            })) as Meeting[];
        },
        // Keeps data in memory for 2 minutes after the component unmounts
        gcTime: 1000 * 60 * 2,
    })

    // Replace by server endpoint
    const otherMeetingUsers = useMemo(() => {
        if (!meetingEvents) return [];

        // Use a Map to store unique users by their ID
        const userMap = new Map<number, {
            userID: number,
            name: string,
            projectID: number | null,
            projectTitle: string
        }>();

        meetingEvents.forEach((m) => {
            userMap.set(m.organizer.userID, {
                userID: m.organizer.userID,
                name: m.organizer.name,
                projectID: userProjects[0]?.projectID ?? null,
                projectTitle: userProjects[0]?.title ?? ""
            });
            userMap.set(m.attendee.userID, {
                userID: m.attendee.userID,
                name: m.attendee.name,
                projectID: m.project.projectID,
                projectTitle: m.project.title
            });
        });

        return Array.from(userMap.values()).filter(u => u.userID !== userID);
    }, [meetingEvents]);

    const handleSlotSelect = (slot: { start: Date; end: Date; }) => {
        setSelectedMeeting(null);
        setSelectedSlot({ start: slot.start, end: slot.end });
    };

    const handleEventSelect = (arg: EventClickArg) => {
        setSelectedSlot(null);
        setSelectedMeeting(arg.event.extendedProps as unknown as Meeting);
    };

    const handleBookMeeting = (newMeetingData: MeetingFormData) => {
        setSelectedSlot(null);

        meetingMutation.mutate({
            url: `${origin}/api/users/${userID}/projects/${newMeetingData.projectID}/meetings`,
            data: newMeetingData
        });
    };

    const handleUpdateDescription = (newDesc: string) => {
        if (!selectedMeeting) return;

        setSelectedMeeting({ ...selectedMeeting, description: newDesc });

        meetingMutation.mutate({
            url: `${origin}/api/users/${userID}/meetings/${selectedMeeting?.meetingID}/edit-description`,
            data: { description: newDesc }
        });
    }

    const handleCancelMeeting = () => {
        setSelectedMeeting(null);

        meetingMutation.mutate({
            url: `${origin}/api/users/${userID}/meetings/${selectedMeeting?.meetingID}/cancel`,
            data: {}
        });
    };

    const handleAcceptMeeting = () => {
        if (!selectedMeeting) return;

        setSelectedMeeting({ ...selectedMeeting, status: "accepted" });
        meetingMutation.mutate({
            url: `${origin}/api/users/${userID}/meetings/${selectedMeeting?.meetingID}/accept`,
            data: {}
        });
    };

    const handleRejectMeeting = () => {
        meetingMutation.mutate({
            url: `${origin}/api/users/${userID}/meetings/${selectedMeeting?.meetingID}/reject`,
            data: {}
        });
    };

    return (
        <>
            <Scheduler
                // key={meetingEvents?.length}
                userID={userID}
                meetingData={meetingEvents || []}
                handleSlotSelect={handleSlotSelect}
                handleEventSelect={handleEventSelect}
            />

            <SchedulerActions>
                <SchedulerActions.Header title={selectedSlot ? "Book Meeting" : "Event Details"} />
                { /* If an empty slot has been selected, show BookMeetingForm */}
                {selectedSlot ?
                    <BookMeetingForm
                        start={selectedSlot.start}
                        end={selectedSlot.end}>
                        <BookMeetingForm.AttendeeSelect otherMeetingUsers={otherMeetingUsers} />
                        <BookMeetingForm.SubmitButton handleBookMeeting={handleBookMeeting} />
                    </BookMeetingForm>
                    /* If a meeting has been selected, show the details*/
                    : selectedMeeting ?
                        <MeetingDetails meetingEvent={selectedMeeting} >
                            <MeetingDetails.DescriptionSection handleUpdateDescription={handleUpdateDescription} />

                            {selectedMeeting.status == "pending" &&
                                <SchedulerActions.BookedMeetingActions
                                    isOrganizer={selectedMeeting.organizer.userID === userID}
                                    isAttendee={selectedMeeting.attendee.userID === userID}
                                    handleCancel={handleCancelMeeting}
                                    handleAccept={handleAcceptMeeting}
                                    handleReject={handleRejectMeeting}
                                />}

                            <MeetingDetails.MeetingStatus
                                isMeetingParticipant={
                                    selectedMeeting.attendee.userID === userID
                                    || selectedMeeting.organizer.userID === userID}
                                status={selectedMeeting.status} />
                        </MeetingDetails>
                        // If nothing is selected (default)
                        : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }} >
                            Click an event on the calendar to see details and actions.
                        </Typography>
                }

            </SchedulerActions>
        </>
    )
}