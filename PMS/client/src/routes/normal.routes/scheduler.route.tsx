import { useState } from "react";
import type { EventClickArg } from "@fullcalendar/core/index.js";
import Scheduler from "../../components/scheduler.components/scheduler.component";
import SchedulerActions from "../../components/scheduler.components/scheduler-actions.component";
import { BookMeetingForm } from "../../components/scheduler.components/book-meeting-form.component";
import { MeetingDetails } from "../../components/scheduler.components/meeting-details.component";
import { Typography } from "@mui/material";
import type { Meeting, MeetingFormData, Project, User } from "../../lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageLayout from "../../components/layout.components/page-layout.component";
import { useAuth } from "../../providers/auth.provider";

export default function SchedulerRoute() {
  const { authState, authorizedAPI } = useAuth();
  const user = authState.user as User;

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  /* ---------------------------------------------------------------------------------- */

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      method,
      url,
      data,
    }: {
      method: string;
      url: string;
      data: any;
      invalidateQueryKeys: any[][];
    }) => await authorizedAPI(url, { method: method, json: data }),
    onSuccess: (_data, variables) =>
      variables.invalidateQueryKeys.forEach((key) =>
        queryClient.invalidateQueries({
          queryKey: key,
        })
      ),
  });

  const { data: meetingEvents, isLoading: meetingsLoading } = useQuery({
    queryKey: [user.userID.toString(), "meetings"],
    queryFn: async (): Promise<Meeting[]> =>
      await authorizedAPI.get(`api/users/${user.userID}/meetings`).json(),
    select(data) {
      return data.map((meeting) => ({
        ...meeting,
        start: new Date(meeting.start),
        end: new Date(meeting.end),
      }));
    },
    retry: 1,
  });

  const { data: otherMeetingUsers, isLoading: otherUsersLoading } = useQuery({
    queryKey: [user.userID.toString(), "projects"],
    queryFn: async (): Promise<Project[]> =>
      await authorizedAPI.get(`api/users/${user.userID}/projects`).json(),
    select(data) {
      if (user.role === "student") {
        return data
          .map((p) => ({
            userID: p.supervisor?.userID ?? 0,
            name: p.supervisor?.name ?? "",
            projectID: p.projectID,
            projectTitle: p.title,
          }))
          .filter((u) => u.userID !== 0);
      } else if (user.role === "supervisor") {
        return data
          .map((p) => ({
            userID: p.student?.userID ?? 0,
            name: p.student?.name ?? "",
            projectID: p.projectID,
            projectTitle: p.title,
          }))
          .filter((u) => u.userID !== 0);
      }
    },
    retry: 1,
  });

  /* ---------------------------------------------------------------------------------- */

  const handleSlotSelect = (slot: { start: Date; end: Date }) => {
    setSelectedMeeting(null);
    setSelectedSlot({ start: slot.start, end: slot.end });
  };

  const handleEventSelect = (arg: EventClickArg) => {
    setSelectedSlot(null);
    setSelectedMeeting(arg.event.extendedProps as unknown as Meeting);
  };

  /* ---------------------------------------------------------------------------------- */

  const handleBookMeeting = (newMeetingData: MeetingFormData) => {
    setSelectedSlot(null);
    console.log("Booking meeting with data:", newMeetingData);

    mutation.mutate({
      method: "post",
      url: `api/users/${user.userID}/projects/${newMeetingData.projectID}/meetings`,
      data: newMeetingData,
      invalidateQueryKeys: [[user.userID.toString(), "meetings"]],
    });
  };

  const handleUpdateDescription = (newDesc: string) => {
    if (!selectedMeeting) return;

    setSelectedMeeting({ ...selectedMeeting, description: newDesc });
    mutation.mutate({
      method: "put",
      url: `api/users/${user.userID}/meetings/${selectedMeeting?.meetingID}/edit-description`,
      data: { description: newDesc },
      invalidateQueryKeys: [[user.userID.toString(), "meetings"]],
    });
  };

  const handleCancelMeeting = () => {
    setSelectedMeeting(null);

    mutation.mutate({
      method: "delete",
      url: `api/users/${user.userID}/meetings/${selectedMeeting?.meetingID}/cancel`,
      data: {},
      invalidateQueryKeys: [[user.userID.toString(), "meetings"]],
    });
  };

  const handleAcceptMeeting = () => {
    if (!selectedMeeting) return;

    setSelectedMeeting({ ...selectedMeeting, status: "accepted" });
    mutation.mutate({
      method: "put",
      url: `api/users/${user.userID}/meetings/${selectedMeeting?.meetingID}/accept`,
      data: {},
      invalidateQueryKeys: [[user.userID.toString(), "meetings"]],
    });
  };

  const handleRejectMeeting = () => {
    setSelectedMeeting(null);
    mutation.mutate({
      method: "delete",
      url: `api/users/${user.userID}/meetings/${selectedMeeting?.meetingID}/reject`,
      data: {},
      invalidateQueryKeys: [[user.userID.toString(), "meetings"]],
    });
  };

  /* ---------------------------------------------------------------------------------- */

  return (
    <PageLayout.Normal>
      <Scheduler
        userID={user.userID}
        meetingData={meetingEvents || []}
        handleSlotSelect={handleSlotSelect}
        handleEventSelect={handleEventSelect}
      />

      <SchedulerActions>
        <SchedulerActions.Header
          title={selectedSlot ? "Book Meeting" : "Event Details"}
        />
        {/* If an empty slot has been selected, show BookMeetingForm */}
        {selectedSlot && (
          <BookMeetingForm start={selectedSlot.start} end={selectedSlot.end}>
            <BookMeetingForm.AttendeeSelect
              otherMeetingUsers={otherMeetingUsers ?? []}
            />
            <BookMeetingForm.SubmitButton
              handleBookMeeting={handleBookMeeting}
            />
          </BookMeetingForm>
        )}

        {/* If a meeting has been selected, show the details */}
        {selectedMeeting && (
          <MeetingDetails meetingEvent={selectedMeeting}>
            <MeetingDetails.DescriptionSection
              isMeetingParticipant={
                selectedMeeting.attendee.userID === user.userID ||
                selectedMeeting.organizer.userID === user.userID
              }
              handleUpdateDescription={handleUpdateDescription}
            />

            {selectedMeeting.status == "pending" && (
              <SchedulerActions.BookedMeetingActions
                isOrganizer={selectedMeeting.organizer.userID === user.userID}
                isAttendee={selectedMeeting.attendee.userID === user.userID}
                handleCancel={handleCancelMeeting}
                handleAccept={handleAcceptMeeting}
                handleReject={handleRejectMeeting}
              />
            )}

            <MeetingDetails.MeetingStatus
              isMeetingParticipant={
                selectedMeeting.attendee.userID === user.userID ||
                selectedMeeting.organizer.userID === user.userID
              }
              status={selectedMeeting.status}
            />
          </MeetingDetails>
        )}

        {/* If nothing is selected (default) */}
        {!selectedSlot && !selectedMeeting && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Click an event on the calendar to see details and actions.
          </Typography>
        )}
      </SchedulerActions>
    </PageLayout.Normal>
  );
}
