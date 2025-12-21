import { useState } from 'react';
import type { EventClickArg } from '@fullcalendar/core/index.js'
import Scheduler from '../../components/scheduler.components/scheduler.component';
import SchedulerActions from '../../components/scheduler.components/scheduler-actions.component';
import { BookMeetingForm } from '../../components/scheduler.components/book-meeting-form.component';
import { MeetingDetails } from '../../components/scheduler.components/meeting-details.component';
import { Typography } from '@mui/material';
import type { Meeting, MeetingFormData, Project } from '../../lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { origin, user } from '../../lib/temp';

export default function SchedulerRoute() {
    const queryClient = useQueryClient();
    const meetingMutation = useMutation({
        mutationFn: async ({ method, url, data }: { method?: string, url: string, data: any }) => {
            const httpClient = ky.create({ method: method ?? "post" })
            const response = await httpClient(url, { json: data });
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
    const { data: meetingEvents, isLoading: meetingsLoading } = useQuery({
        queryKey: ['meetings'],
        queryFn: async () => {
            const response = await ky.get(`${origin}/api/users/${user.userID}/meetings`);
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
    })

    const { data: otherMeetingUsers, isLoading: otherUsersLoading } = useQuery({
        queryKey: ['attendees'],
        queryFn: async () => {
            const response = await ky.get(`${origin}/api/users/${user.userID}/projects`);
            if (!response.ok)
                throw new Error('Failed to fetch projects');

            const projectData = await response.json() as Project[];
            console.log("Fetched projects for attendees:", projectData);
            if (user.role === "student") {
                return projectData.map((p) => ({
                    userID: p.supervisor?.userID ?? 0,
                    name: p.supervisor?.name ?? "",
                    projectID: p.projectID,
                    projectTitle: p.title
                })).filter(u => u.userID !== 0);
            } else if (user.role === "supervisor") {
                return projectData.map((p) => ({
                    userID: p.student?.userID ?? 0,
                    name: p.student?.name ?? "",
                    projectID: p.projectID,
                    projectTitle: p.title,
                })).filter(u => u.userID !== 0);
            }
        },
    });

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
        console.log("Booking meeting with data:", newMeetingData);

        meetingMutation.mutate({
            url: `${origin}/api/users/${user.userID}/projects/${newMeetingData.projectID}/meetings`,
            data: newMeetingData
        });
    };

    const handleUpdateDescription = (newDesc: string) => {
        if (!selectedMeeting) return;

        setSelectedMeeting({ ...selectedMeeting, description: newDesc });
        meetingMutation.mutate({
            method: "put",
            url: `${origin}/api/users/${user.userID}/meetings/${selectedMeeting?.meetingID}/edit-description`,
            data: { description: newDesc }
        });
    }

    const handleCancelMeeting = () => {
        setSelectedMeeting(null);

        meetingMutation.mutate({
            method: "delete",
            url: `${origin}/api/users/${user.userID}/meetings/${selectedMeeting?.meetingID}/cancel`,
            data: {}
        });
    };

    const handleAcceptMeeting = () => {
        if (!selectedMeeting) return;

        setSelectedMeeting({ ...selectedMeeting, status: "accepted" });
        meetingMutation.mutate({
            method: "put",
            url: `${origin}/api/users/${user.userID}/meetings/${selectedMeeting?.meetingID}/accept`,
            data: {}
        });
    };

    const handleRejectMeeting = () => {
        setSelectedMeeting(null);
        meetingMutation.mutate({
            method: "delete",
            url: `${origin}/api/users/${user.userID}/meetings/${selectedMeeting?.meetingID}/reject`,
            data: {}
        });
    };

    return (
        <>
            <Scheduler
                userID={user.userID}
                meetingData={meetingEvents || []}
                handleSlotSelect={handleSlotSelect}
                handleEventSelect={handleEventSelect}
            />

            <SchedulerActions>
                <SchedulerActions.Header title={selectedSlot ? "Book Meeting" : "Event Details"} />
                { /* If an empty slot has been selected, show BookMeetingForm */}
                {selectedSlot &&
                    <BookMeetingForm start={selectedSlot.start} end={selectedSlot.end} >
                        <BookMeetingForm.AttendeeSelect otherMeetingUsers={otherMeetingUsers ?? []} />
                        <BookMeetingForm.SubmitButton handleBookMeeting={handleBookMeeting} />
                    </BookMeetingForm>}

                {/* If a meeting has been selected, show the details */}
                {selectedMeeting &&
                    <MeetingDetails meetingEvent={selectedMeeting} >
                        <MeetingDetails.DescriptionSection
                            isMeetingParticipant={
                                selectedMeeting.attendee.userID === user.userID
                                || selectedMeeting.organizer.userID === user.userID}
                            handleUpdateDescription={handleUpdateDescription} />

                        {selectedMeeting.status == "pending" &&
                            <SchedulerActions.BookedMeetingActions
                                isOrganizer={selectedMeeting.organizer.userID === user.userID}
                                isAttendee={selectedMeeting.attendee.userID === user.userID}
                                handleCancel={handleCancelMeeting}
                                handleAccept={handleAcceptMeeting}
                                handleReject={handleRejectMeeting}
                            />}

                        <MeetingDetails.MeetingStatus
                            isMeetingParticipant={
                                selectedMeeting.attendee.userID === user.userID
                                || selectedMeeting.organizer.userID === user.userID}
                            status={selectedMeeting.status} />
                    </MeetingDetails>}

                {/* If nothing is selected (default) */}
                {(!selectedSlot && !selectedMeeting) &&
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }} >
                        Click an event on the calendar to see details and actions.
                    </Typography>}

            </SchedulerActions>
        </>
    )
}