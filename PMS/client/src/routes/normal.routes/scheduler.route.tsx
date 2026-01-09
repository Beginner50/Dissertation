import { useState } from "react";
import type { EventClickArg } from "@fullcalendar/core/index.js";
import Scheduler from "../../components/scheduler.components/scheduler.component";
import SchedulerActions from "../../components/scheduler.components/scheduler-actions.component";
import { BookMeetingForm } from "../../components/scheduler.components/book-meeting-form.component";
import { MeetingDetails } from "../../components/scheduler.components/meeting-details.component";
import { Box, Divider, Stack, Typography } from "@mui/material";
import type { Meeting, MeetingFormData, Project, User } from "../../lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../providers/auth.provider";
import { AccessTime, Event, Person } from "@mui/icons-material";

export default function SchedulerRoute() {
  const { authState, authorizedAPI } = useAuth();
  const user = authState.user as User;

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(
    null
  );

  const [meetingFormData, setMeetingFormData] = useState<MeetingFormData>({
    description: "",
    start: new Date(),
    end: new Date(),
    attendeeID: 0,
    projectID: 0,
    taskID: 0,
  });

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
    }) => await authorizedAPI(url, { method, json: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [user.userID, "meetings"] });
    },
  });

  const { data: meetingEvents } = useQuery({
    queryKey: [user.userID, "meetings"],
    queryFn: async (): Promise<Meeting[]> =>
      await authorizedAPI.get(`api/users/${user.userID}/meetings`).json(),
    select: (data) =>
      data.map((m) => ({ ...m, start: new Date(m.start), end: new Date(m.end) })),
    retry: 1,
  });

  const { data: userProjects } = useQuery({
    queryKey: [user.userID, "projects"],
    queryFn: async (): Promise<Project[]> =>
      await authorizedAPI.get(`api/users/${user.userID}/projects`).json(),
    select: (data) => data.filter((p: Project) => p.student?.userID !== 0),
    retry: 1,
  });

  /* ---------------------------------------------------------------------------------- */

  const handleSlotSelect = (slot: { start: Date; end: Date }) => {
    setSelectedMeeting(null);
    setSelectedSlot({ start: slot.start, end: slot.end });

    setMeetingFormData({
      description: "",
      start: slot.start,
      end: slot.end,
      attendeeID: 0,
      projectID: 0,
      taskID: 0,
    });
  };

  const handleEventSelect = (arg: EventClickArg) => {
    setSelectedSlot(null);
    setSelectedMeeting(arg.event.extendedProps as unknown as Meeting);
  };

  /* ---------------------------------------------------------------------------------- */

  const handleDescriptionChange = (val: string) => {
    setMeetingFormData((prev) => ({ ...prev, description: val }));
  };

  const handleTimeChange = (type: "start" | "end", val: string) => {
    const [hours, minutes] = val.split(":").map(Number);
    setMeetingFormData((prev) => {
      const date = new Date(prev[type]);
      date.setHours(hours, minutes);
      return { ...prev, [type]: date };
    });
  };

  const handleProjectChange = (project: Project) => {
    const attendeeID =
      user.role === "supervisor" ? project.student?.userID : project.supervisor?.userID;

    setMeetingFormData((prev) => ({
      ...prev,
      projectID: project.projectID,
      attendeeID: attendeeID || 0,
      taskID: project.tasks?.[0]?.taskID || 0,
    }));
  };

  const handleTaskChange = (taskID: number) => {
    setMeetingFormData({ ...meetingFormData, taskID });
  };

  /* ---------------------------------------------------------------------------------- */

  const handleBookMeeting = () => {
    mutation.mutate({
      method: "post",
      url: `api/users/${user.userID}/meetings`,
      data: meetingFormData,
    });
    setSelectedSlot(null);
  };

  const handleUpdateDescription = (newDesc: string) => {
    if (!selectedMeeting) return;
    setSelectedMeeting({ ...selectedMeeting, description: newDesc });
    mutation.mutate({
      method: "put",
      url: `api/users/${user.userID}/meetings/${selectedMeeting.meetingID}/edit-description`,
      data: { description: newDesc },
    });
  };

  const handleAcceptMeeting = () => {
    if (!selectedMeeting) return;
    mutation.mutate({
      method: "put",
      url: `api/users/${user.userID}/meetings/${selectedMeeting.meetingID}/accept`,
      data: {},
    });
    setSelectedMeeting(null);
  };

  const handleRejectMeeting = () => {
    if (!selectedMeeting) return;
    mutation.mutate({
      method: "delete",
      url: `api/users/${user.userID}/meetings/${selectedMeeting.meetingID}/reject`,
      data: {},
    });
    setSelectedMeeting(null);
  };

  const handleCancelMeeting = () => {
    if (!selectedMeeting) return;
    mutation.mutate({
      method: "delete",
      url: `api/users/${user.userID}/meetings/${selectedMeeting.meetingID}/cancel`,
      data: {},
    });
    setSelectedMeeting(null);
  };

  /* ---------------------------------------------------------------------------------- */

  const isFormValid = meetingFormData.projectID !== 0 && meetingFormData.taskID !== 0;

  const attendee = userProjects?.find((p) => p.projectID === meetingFormData.projectID)?.[
    user.role === "supervisor" ? "student" : "supervisor"
  ];
  const selectableTasks =
    userProjects?.find((p) => p.projectID === meetingFormData.projectID)?.tasks || [];

  return (
    <Stack
      direction="row"
      spacing="2vw"
      sx={{
        flexGrow: 1,
        ml: "4.5vw",
        mr: "3vw",
        mb: "2vh",
      }}>
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
        {selectedSlot && (
          <BookMeetingForm>
            <BookMeetingForm.ProjectSelect
              projects={userProjects || []}
              selectedID={meetingFormData.projectID}
              onProjectChange={handleProjectChange}
            />
            <BookMeetingForm.TaskSelect
              tasks={selectableTasks}
              selectedTaskID={meetingFormData.taskID}
              onTaskChange={handleTaskChange}
              disabled={!meetingFormData.projectID}
            />
            <BookMeetingForm.Description
              description={meetingFormData.description}
              onDescriptionChange={handleDescriptionChange}
            />
            <BookMeetingForm.TimePickers
              start={meetingFormData.start}
              end={meetingFormData.end}
              onTimeChange={handleTimeChange}
            />

            <BookMeetingForm.AttendeeDisplay name={attendee?.name} />

            <BookMeetingForm.SubmitButton
              isValid={isFormValid && !mutation.isPending}
              handleBookMeeting={handleBookMeeting}
            />
          </BookMeetingForm>
        )}

        {selectedMeeting && (
          <MeetingDetails>
            <MeetingDetails.Header title={selectedMeeting.task.title} />

            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <MeetingDetails.Status status={selectedMeeting.status} />

              <MeetingDetails.InfoRow
                icon={<Person fontSize="small" />}
                label="Organizer"
                value={selectedMeeting.organizer.name}
              />

              <MeetingDetails.InfoRow
                icon={<Event fontSize="small" />}
                label="Attendee"
                value={
                  selectedMeeting.status === "pending"
                    ? "Awaiting Confirmation"
                    : selectedMeeting.attendee.name
                }
              />

              <MeetingDetails.InfoRow
                icon={<AccessTime fontSize="small" />}
                label="Time"
                value={`${selectedMeeting.start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${selectedMeeting.end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
              />
            </Stack>

            <Divider />

            <MeetingDetails.Description
              description={selectedMeeting.description}
              isMeetingParticipant={
                selectedMeeting.organizer.userID == user.userID ||
                selectedMeeting.attendee.userID == user.userID
              }
              handleUpdateDescription={handleUpdateDescription}
            />

            {selectedMeeting.status === "pending" && (
              <Box sx={{ mt: 2 }}>
                <SchedulerActions.BookedMeetingActions
                  isOrganizer={selectedMeeting.organizer.userID === user.userID}
                  isAttendee={selectedMeeting.attendee.userID === user.userID}
                  handleCancel={handleCancelMeeting}
                  handleAccept={handleAcceptMeeting}
                  handleReject={handleRejectMeeting}
                />
              </Box>
            )}
          </MeetingDetails>
        )}

        {!selectedSlot && !selectedMeeting && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Click an event on the calendar to see details and actions.
          </Typography>
        )}
      </SchedulerActions>
    </Stack>
  );
}
