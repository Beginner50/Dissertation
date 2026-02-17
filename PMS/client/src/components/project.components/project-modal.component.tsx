import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Button,
  FormGroup,
  FormControl,
  type SelectChangeEvent,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { Project, User } from "../../lib/types";

export type ModalMode = "create" | "edit" | "archive" | "restore";
export type ModalState = {
  mode: ModalMode;
  open: boolean;
};

export default function ProjectModal({
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

ProjectModal.Header = ({ mode }: { mode: ModalMode }) => {
  const titles = {
    create: "Create New Project",
    edit: "Edit Project Details",
    archive: "Archive Project",
    restore: "Restore Project",
  };
  return <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>{titles[mode]}</DialogTitle>;
};

ProjectModal.Fields = ({ children }: { children: ReactNode }) => (
  <DialogContent dividers>
    <FormGroup>
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        {children}
      </Stack>
    </FormGroup>
  </DialogContent>
);

ProjectModal.ProjectID = ({ projectID }: { projectID: number }) => (
  <FormControl fullWidth>
    <TextField label="Project ID" value={projectID} disabled size="small" />
  </FormControl>
);

ProjectModal.ProjectTitle = ({
  title,
  handleTitleChange,
}: {
  title: string;
  handleTitleChange: (v: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(title);

  useEffect(() => {
    setLocalValue(title);
  }, [title]);

  useEffect(() => {
    if (title == "" || (localValue == "" && title != "")) handleTitleChange(localValue);
  }, [localValue]);

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

ProjectModal.ProjectDescription = ({
  description,
  handleDescriptionChange,
}: {
  description: string;
  handleDescriptionChange: (v: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(description);

  useEffect(() => {
    setLocalValue(description);
  }, [description]);

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

ProjectModal.UserSelect = ({
  label,
  selectedUser,
  users,
  handleUserChange,
}: {
  label: string;
  selectedUser?: User;
  users: User[];
  handleUserChange: (selectedUser?: User) => void;
}) => {
  const handleChange = (e: SelectChangeEvent) => {
    const value = e.target.value;

    if (value === "") {
      handleUserChange(undefined);
      return;
    }

    const foundUser = users.find((u) => u.userID.toString() === value);
    handleUserChange(foundUser);
  };

  return (
    <FormControl fullWidth size="small" sx={{ mt: 2 }}>
      <InputLabel id={`user-select-label-${label}`}>{label}</InputLabel>
      <Select
        labelId={`user-select-label-${label}`}
        value={selectedUser?.userID?.toString() || ""}
        label={label}
        onChange={handleChange}>
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {users.map((user) => (
          <MenuItem key={user.userID} value={user.userID.toString()}>
            {user.name} ({user.email})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

ProjectModal.ArchiveWarning = () => (
  <Alert
    severity="warning"
    variant="outlined"
    sx={{ fontWeight: "medium", marginLeft: "1rem", marginRight: "1rem" }}>
    This project will be archived. To revert this action, contact the administrator.
  </Alert>
);

ProjectModal.RestoreWarning = () => (
  <Alert
    severity="warning"
    variant="outlined"
    sx={{ fontWeight: "medium", marginLeft: "1rem", marginRight: "1rem" }}>
    This project will be restored from archive.
  </Alert>
);

ProjectModal.Actions = ({
  mode,
  isValid,
  isLoading,
  handleCancelClick,
  handleCreateProject,
  handleEditProject,
  handleArchiveProject,
  handleRestoreProject,
}: {
  mode: ModalMode;
  isValid: boolean;
  isLoading: boolean;
  handleCancelClick: () => void;
  handleCreateProject?: () => void;
  handleEditProject: () => void;
  handleArchiveProject?: () => void;
  handleRestoreProject?: () => void;
}) => {
  const labels = {
    create: "Create",
    edit: "Save",
    archive: "Archive",
    restore: "Restore",
  };
  const actions = {
    create: handleCreateProject,
    edit: handleEditProject,
    archive: handleArchiveProject,
    restore: handleRestoreProject,
  };

  return (
    <DialogActions sx={{ p: 2, px: 3 }}>
      <Button onClick={handleCancelClick} color="inherit">
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={actions[mode]}
        color={mode === "archive" ? "error" : "primary"}
        loading={isLoading}
        disabled={!isValid}>
        {labels[mode]}
      </Button>
    </DialogActions>
  );
};
