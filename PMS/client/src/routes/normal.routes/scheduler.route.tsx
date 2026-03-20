import { useCallback, useEffect, useState } from "react";
import type { EventClickArg } from "@fullcalendar/core/index.js";
import Scheduler from "../../components/scheduler.components/scheduler.component";
import SchedulerActions from "../../components/scheduler.components/scheduler-actions.component";
import { BookMeetingForm } from "../../components/scheduler.components/book-meeting-form.component";
import { MeetingDetails } from "../../components/scheduler.components/meeting-details.component";
import { Box, Divider, Stack, Typography } from "@mui/material";
import type {
  Meeting,
  MeetingFormData,
  OutletContext,
  Project,
  User,
} from "../../lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../providers/auth.provider";
import { AccessTime, Event, Person } from "@mui/icons-material";
import { useOutletContext } from "react-router";
import { extractErrorMessage } from "../../lib/utils";

export default function SchedulerRoute() {
  const { setErrorMessage } = useOutletContext<OutletContext>();

  const { authState, authorizedAPI } = useAuth();
  const user = authState.user as User;

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(
    null,
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

  /*
    During transfer from the server to the client and vice-versa, temporal data is converted
    into UTC format to account for timezones. 

    Instantiating a Date object from the UTC string representation will dynamically parse and
    convert the temporal data into the user's local date and time.
  */
  const { data: meetingEvents } = useQuery({
    queryKey: [user.userID, "meetings"],
    queryFn: async (): Promise<Meeting[]> =>
      await authorizedAPI.get(`api/users/${user.userID}/meetings`).json(),
    select: (data: any[]) => {
      return data.map((m) => ({
        ...m,
        start: new Date(m.start),
        end: new Date(m.end),
      }));
    },
    retry: 1,
  });

  const { data: userProjects } = useQuery({
    queryKey: [user.userID, "projects"],
    queryFn: async (): Promise<{ items: Project[]; totalCount: number }> =>
      await authorizedAPI
        .get(`api/users/${user.userID}/projects`, {
          searchParams: { limit: 50, offset: 0 },
        })
        .json(),
    select: (data) => data.items.filter((p: Project) => p.students[0] != null),
    retry: 1,
  });

  /* ---------------------------------------------------------------------------------- */

  const handleSlotSelect = (slot: { start: Date; end: Date }) => {
    setSelectedMeeting(null);
    setSelectedSlot({ start: slot.start, end: slot.end });

    setMeetingFormData({
      ...meetingFormData,
      start: slot.start,
      end: slot.end,
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

  const handleStartChange = (start: Date | null) => {
    if (start != null)
      setMeetingFormData((prev) => ({
        ...prev,
        start: start,
      }));
  };

  const handleEndChange = (end: Date | null) => {
    if (end != null)
      setMeetingFormData((prev) => ({
        ...prev,
        end: end,
      }));
  };

  const handleProjectChange = (project: Project) => {
    const attendeeID =
      user.role === "supervisor"
        ? project.students[0]?.userID
        : project.supervisors[0]?.userID;

    setMeetingFormData((prev) => ({
      ...prev,
      projectID: project.projectID,
      attendeeID: attendeeID || 0,
      taskID: project.tasks?.[0]?.taskID || 0,
    }));
  };

  const handleTaskChange = (taskID: number) => {
    setMeetingFormData((prev) => ({ ...prev, taskID }));
  };

  /* ---------------------------------------------------------------------------------- */

  const handleBookMeeting = () => {
    mutation.mutate(
      {
        method: "post",
        url: `api/users/${user.userID}/projects/${meetingFormData.projectID}/tasks/${meetingFormData.taskID}/meetings`,
        data: {
          ...meetingFormData,
          start: meetingFormData.start.toISOString(),
          end: meetingFormData.end.toISOString(),
        },
      },
      {
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to book meeting.");
        },
        onSettled: () => {
          setSelectedSlot(null);
        },
      },
    );
  };

  const handleUpdateDescription = (newDesc: string) => {
    if (!selectedMeeting) return;
    setSelectedMeeting({ ...selectedMeeting, description: newDesc });
    mutation.mutate(
      {
        method: "put",
        url: `api/users/${user.userID}/meetings/${selectedMeeting.meetingID}`,
        data: { description: newDesc },
      },
      {
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to update meeting details.");
        },
      },
    );
  };

  const handleAcceptMeeting = () => {
    if (!selectedMeeting) return;
    mutation.mutate(
      {
        method: "put",
        url: `api/users/${user.userID}/meetings/${selectedMeeting.meetingID}/accept`,
        data: {},
      },
      {
        onSettled: () => {
          setSelectedMeeting(null);
        },
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to accept meeting.");
        },
      },
    );
  };

  const handleRejectMeeting = () => {
    if (!selectedMeeting) return;
    mutation.mutate(
      {
        method: "delete",
        url: `api/users/${user.userID}/meetings/${selectedMeeting.meetingID}/reject`,
        data: {},
      },
      {
        onSettled: () => {
          setSelectedMeeting(null);
        },
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to reject meeting.");
        },
      },
    );
  };

  const handleCancelMeeting = () => {
    if (!selectedMeeting) return;
    mutation.mutate(
      {
        method: "delete",
        url: `api/users/${user.userID}/meetings/${selectedMeeting.meetingID}/cancel`,
        data: {},
      },
      {
        onSettled: () => {
          setSelectedMeeting(null);
        },
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to cancel meeting.");
        },
      },
    );
  };

  /* ---------------------------------------------------------------------------------- */

  const isFormValid = meetingFormData.projectID !== 0 && meetingFormData.taskID !== 0;

  const selectedProject = userProjects?.find(
    (p) => p.projectID === meetingFormData.projectID,
  );
  const projectAttendees = selectedProject?.students.concat(selectedProject.supervisors);
  const attendee = projectAttendees?.find((u) => u.userID == meetingFormData.attendeeID);

  const selectableTasks =
    userProjects?.find((p) => p.projectID === meetingFormData.projectID)?.tasks || [];

  const startTimePart = selectedMeeting?.start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endTimePart = selectedMeeting?.end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <Stack
      direction="row"
      spacing="2vw"
      sx={{
        flexGrow: 1,
        mt: "3vh",
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
              onStartChange={handleStartChange}
              onEndChange={handleEndChange}
            />

            <BookMeetingForm.AttendeeDisplay name={attendee?.name} />

            <BookMeetingForm.SubmitButton
              isValid={isFormValid}
              isLoading={mutation.status == "pending"}
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
                value={`${startTimePart} - ${endTimePart}`}
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
                  isLoading={mutation.status == "pending"}
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
