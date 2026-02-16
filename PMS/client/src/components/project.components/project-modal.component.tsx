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

export type ModalMode = "create" | "edit" | "archive";
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
    if (title == "" || (localValue == "" && title != ""))
      handleTitleChange(localValue);
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
  <Alert
    severity="warning"
    variant="outlined"
    sx={{ fontWeight: "medium", marginLeft: "1rem", marginRight: "1rem" }}>
    Archiving this project will remove it from the list.
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
}: {
  mode: ModalMode;
  isValid: boolean;
  isLoading: boolean;
  handleCancelClick: () => void;
  handleCreateProject: () => void;
  handleEditProject: () => void;
  handleArchiveProject: () => void;
}) => {
  const labels = {
    create: "Create",
    edit: "Save",
    archive: "Archive",
  };
  const actions = {
    create: handleCreateProject,
    edit: handleEditProject,
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
        loading={isLoading}
        disabled={!isValid}>
        {labels[mode]}
      </Button>
    </DialogActions>
  );
};
