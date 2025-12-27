import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { type ReactNode } from "react";

export type ModalMode = "create" | "edit" | "add-student" | "delete";
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
      style={{
        maxWidth: "45vw",
        marginLeft: "auto",
        marginRight: "auto",
      }}
      open={open}
    >
      {children}
    </Dialog>
  );
}

TaskModal.Header = ({ mode }: { mode: ModalMode }) => {
  const titles = {
    create: "Create New Task",
    edit: "Edit Task Details",
    delete: "Delete Task",
    "add-student": "Add Student",
  };
  return <DialogTitle sx={{ fontWeight: "bold" }}>{titles[mode]}</DialogTitle>;
};

TaskModal.Fields = ({ children }: { children: ReactNode }) => {
  return (
    <DialogContent dividers>
      <Stack spacing={2} sx={{ mt: 1 }}>
        {children}
      </Stack>
    </DialogContent>
  );
};

TaskModal.TaskID = ({
  taskID,
  visible,
}: {
  taskID: number;
  visible: boolean;
}) => {
  if (visible)
    return (
      <TextField
        label="Task ID"
        value={taskID}
        disabled
        fullWidth
        size="small"
      />
    );
  else return <></>;
};

TaskModal.TaskTitle = ({
  title,
  handleTitleChange,
}: {
  title: string;
  handleTitleChange: (title: string) => void;
}) => {
  return (
    <TextField
      label="Title"
      value={title}
      onChange={(e) => handleTitleChange(e.target.value)}
      fullWidth
      size="small"
    />
  );
};

TaskModal.TaskDescription = ({
  description,
  handleDescriptionChange,
}: {
  description: string;
  handleDescriptionChange: (description: string) => void;
}) => {
  return (
    <TextField
      label="Description"
      value={description}
      onChange={(e) => handleDescriptionChange(e.target.value)}
      multiline
      rows={3}
      fullWidth
      size="small"
    />
  );
};

TaskModal.DueDate = ({
  dueDate,
  handleDueDateChange,
}: {
  dueDate: string;
  handleDueDateChange: (dueDate: string) => void;
}) => {
  //   Due Date must be in ISO date format
  const datePart = dueDate.split("T")[0] ?? "";
  const timePart = dueDate.split("T")[1]?.slice(0, 5) ?? "00:00";

  return (
    <Stack direction="row" spacing={2}>
      <TextField
        label="Due Date"
        type="date"
        value={datePart}
        onChange={(e) => handleDueDateChange(`${e.target.value}T${timePart}Z`)}
        fullWidth
        size="small"
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { min: new Date().toISOString().split("T")[0] },
        }}
      />

      <TextField
        label="Due Time"
        type="time"
        value={timePart}
        onChange={(e) => handleDueDateChange(`${datePart}T${e.target.value}Z`)}
        fullWidth
        size="small"
      />
    </Stack>
  );
};

TaskModal.DeleteWarning = () => (
  <Alert severity="warning">
    <strong>Warning:</strong> This task will be deleted
  </Alert>
);

TaskModal.Actions = ({
  mode,
  disabled,
  handleCancelClick,
  handleCreateTask,
  handleEditTask,
  handleDeleteTask,
  handleAddStudent,
}: {
  mode: ModalMode;
  disabled: boolean;
  handleCancelClick: () => void;
  handleCreateTask: () => void;
  handleEditTask: () => void;
  handleDeleteTask: () => void;
  handleAddStudent: () => void;
}) => {
  const labels = {
    create: "Create",
    edit: "Save",
    delete: "Delete",
    "add-student": "Add",
  };

  const actions = {
    create: handleCreateTask,
    edit: handleEditTask,
    delete: handleDeleteTask,
    "add-student": handleAddStudent,
  };

  return (
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={handleCancelClick} color="inherit">
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={actions[mode]}
        color={mode == "delete" ? "error" : "primary"}
        disabled={disabled}
      >
        {labels[mode]}
      </Button>
    </DialogActions>
  );
};
