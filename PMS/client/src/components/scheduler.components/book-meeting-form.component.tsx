import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { Project } from "../../lib/types";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export function BookMeetingForm({ children }: { children: React.ReactNode }) {
  return (
    <Stack spacing={2.5} sx={{ mt: 1 }}>
      {children}
    </Stack>
  );
}

BookMeetingForm.Description = ({
  description,
  onDescriptionChange,
}: {
  description: string;
  onDescriptionChange: (val: string) => void;
}) => (
  <TextField
    label="Meeting Description"
    value={description}
    onChange={(e) => onDescriptionChange(e.target.value)}
    fullWidth
    multiline
    rows={2}
    size="small"
  />
);

BookMeetingForm.TimePickers = ({
  start,
  end,
  onStartChange,
  onEndChange,
}: {
  start: Date;
  end: Date;
  onStartChange: (start: Date | null) => void;
  onEndChange: (end: Date | null) => void;
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display="flex" gap={2}>
        <TimePicker
          label="Start Time"
          value={start}
          onChange={onStartChange}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
            },
          }}
        />

        <TimePicker
          label="End Time"
          value={end}
          onChange={onEndChange}
          minTime={start}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

BookMeetingForm.ProjectSelect = ({
  projects,
  selectedID,
  onProjectChange,
}: {
  projects: Project[];
  selectedID: number;
  onProjectChange: (project: Project) => void;
}) => (
  <FormControl fullWidth size="small">
    <InputLabel>Select Project</InputLabel>
    <Select
      value={selectedID || ""}
      label="Select Project"
      onChange={(e) => {
        const project = projects.find((p) => p.projectID == e.target.value);
        if (project) onProjectChange(project);
      }}>
      {projects.map((p) => (
        <MenuItem key={p.projectID} value={p.projectID}>
          {p.title}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

BookMeetingForm.AttendeeDisplay = ({ name }: { name?: string }) => (
  <TextField
    label="Attendee"
    value={name || "No attendee assigned"}
    disabled
    fullWidth
    size="small"
  />
);

BookMeetingForm.TaskSelect = ({
  tasks,
  selectedTaskID,
  onTaskChange,
  disabled,
}: {
  tasks: Project["tasks"];
  selectedTaskID: number;
  onTaskChange: (id: number) => void;
  disabled: boolean;
}) => (
  <FormControl fullWidth size="small" disabled={disabled}>
    <InputLabel>Select Associated Task</InputLabel>
    <Select
      value={selectedTaskID || ""}
      label="Select Associated Task"
      onChange={(e) => onTaskChange(Number(e.target.value))}>
      {tasks?.map((task) => (
        <MenuItem key={task.taskID} value={task.taskID}>
          {task.title}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

BookMeetingForm.SubmitButton = ({
  isValid,
  isLoading,
  handleBookMeeting,
}: {
  isValid: boolean;
  isLoading: boolean;
  handleBookMeeting: () => void;
}) => (
  <Button
    variant="contained"
    color="primary"
    onClick={handleBookMeeting}
    disabled={!isValid}
    loading={isLoading}
    fullWidth>
    Book Meeting
  </Button>
);
