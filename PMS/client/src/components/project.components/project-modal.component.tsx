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
} from "@mui/material";

export type ModalMode = "create" | "edit" | "join-project" | "archive";
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
      keepMounted
    >
      {children}
    </Dialog>
  );
}

ProjectModal.Header = ({ mode }: { mode: ModalMode }) => {
  const titles: Record<ModalMode, string> = {
    create: "Create New Project",
    edit: "Edit Project Details",
    "join-project": "Join a Project",
    archive: "Archive Project",
  };
  return (
    <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>{titles[mode]}</DialogTitle>
  );
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

ProjectModal.ProjectID = ({
  projectID,
  visible,
}: {
  projectID: number;
  visible: boolean;
}) =>
  visible ? (
    <FormControl fullWidth>
      <TextField label="Project ID" value={projectID} disabled size="small" />
    </FormControl>
  ) : null;

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
    if (title == "") handleTitleChange(localValue);
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

ProjectModal.ArchiveWarning = () => (
  <Alert severity="warning" variant="outlined" sx={{ fontWeight: "medium" }}>
    Archiving this project will remove it from the list.
  </Alert>
);

ProjectModal.Actions = ({
  mode,
  isValid,
  handleCancelClick,
  handleCreateProject,
  handleEditProject,
  handleArchiveProject,
  handleJoinProject,
}: {
  mode: ModalMode;
  isValid: boolean;
  handleCancelClick: () => void;
  handleCreateProject: () => void;
  handleEditProject: () => void;
  handleJoinProject: () => void;
  handleArchiveProject: () => void;
}) => {
  const labels = {
    create: "Create",
    edit: "Save",
    "join-project": "Join",
    archive: "Archive",
  };
  const actions = {
    create: handleCreateProject,
    edit: handleEditProject,
    "join-project": handleJoinProject,
    archive: handleArchiveProject,
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
        disabled={!isValid}
      >
        {labels[mode]}
      </Button>
    </DialogActions>
  );
};
