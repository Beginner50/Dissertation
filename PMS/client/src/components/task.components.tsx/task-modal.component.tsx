import { memo, useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  FormControl,
  FormGroup,
  CircularProgress,
} from "@mui/material";
import { mergeDateTime, toLocalDateString, toLocalTimeString } from "../../lib/utils";

export type ModalMode = "create" | "edit" | "delete";
export type ModalState = {
  mode: ModalMode;
  open: boolean;
};

export default function TaskModal({
  open,
  children,
}: {
  open: boolean;
  children?: ReactNode;
}) {
  return (
    <Dialog
      fullWidth
      open={open}
      slotProps={{
        paper: {
          sx: { maxWidth: "45vw", mx: "auto" },
        },
      }}
      keepMounted>
      {children}
    </Dialog>
  );
}

TaskModal.Header = ({ mode }: { mode: ModalMode }) => {
  const titles = {
    create: "Create New Task",
    edit: "Edit Task Details",
    delete: "Delete Task",
  };
  return <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>{titles[mode]}</DialogTitle>;
};

TaskModal.Fields = ({ children }: { children: ReactNode }) => (
  <DialogContent dividers>
    <FormGroup>
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        {children}
      </Stack>
    </FormGroup>
  </DialogContent>
);

TaskModal.TaskID = ({ taskID }: { taskID: number }) => (
  <FormControl fullWidth>
    <TextField label="Task ID" value={taskID} disabled size="small" />
  </FormControl>
);

TaskModal.TaskTitle = ({
  title,
  handleTitleChange,
}: {
  title: string;
  handleTitleChange: (v: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(title);

  useEffect(() => setLocalValue(title), [title]);

  useEffect(() => {
    if (title == "") handleTitleChange(localValue);
  }, [title]);

  return (
    <FormControl fullWidth>
      <TextField
        label="Title"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => handleTitleChange(localValue)}
        size="small"
      />
    </FormControl>
  );
};

TaskModal.TaskDescription = ({
  description,
  handleDescriptionChange,
}: {
  description: string;
  handleDescriptionChange: (v: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(description);

  useEffect(() => setLocalValue(description), [description]);

  useEffect(() => {
    if (description == "") handleDescriptionChange(localValue);
  }, [localValue]);

  return (
    <FormControl fullWidth>
      <TextField
        label="Description"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => handleDescriptionChange(localValue)}
        multiline
        rows={3}
        size="small"
      />
    </FormControl>
  );
};

TaskModal.DueDate = ({
  dueDate,
  handleDueDateChange,
}: {
  dueDate: Date;
  handleDueDateChange: (dueDate: Date) => void;
}) => {
  return (
    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <TextField
          label="Due Date"
          type="date"
          value={toLocalDateString(dueDate)}
          onChange={(e) => {
            const newDatePart = e.target.value;
            const newDueDate = mergeDateTime(dueDate, newDatePart, "date");
            handleDueDateChange(newDueDate);
          }}
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: new Date().toISOString() },
          }}
        />
      </FormControl>

      <FormControl fullWidth>
        <TextField
          label="Due Time"
          type="time"
          value={toLocalTimeString(dueDate)}
          onChange={(e) => {
            const newTimePart = e.target.value;
            const newDueDate = mergeDateTime(dueDate, newTimePart, "time");
            handleDueDateChange(newDueDate);
          }}
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />
      </FormControl>
    </Stack>
  );
};

TaskModal.DeleteWarning = () => (
  <Alert
    severity="warning"
    variant="outlined"
    sx={{ fontWeight: "medium", marginLeft: "1rem", marginRight: "1rem" }}>
    <strong>Warning:</strong> This task will be permanently deleted.
  </Alert>
);

TaskModal.Actions = ({
  mode,
  loading,
  disabled,
  handleCancelClick,
  handleCreateTask,
  handleEditTask,
  handleDeleteTask,
}: {
  mode: ModalMode;
  loading: boolean;
  disabled: boolean;
  handleCancelClick: () => void;
  handleCreateTask: () => void;
  handleEditTask: () => void;
  handleDeleteTask: () => void;
}) => {
  const labels = {
    create: "Create",
    edit: "Save",
    delete: "Delete",
  };
  const actions = {
    create: handleCreateTask,
    edit: handleEditTask,
    delete: handleDeleteTask,
  };

  return (
    <DialogActions sx={{ p: 2, px: 3 }}>
      <Button onClick={handleCancelClick} color="inherit">
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={actions[mode]}
        color={mode === "delete" ? "error" : "primary"}
        loading={loading}
        disabled={disabled}>
        {labels[mode]}
      </Button>
    </DialogActions>
  );
};
