import { type ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Button,
} from "@mui/material";

export type ModalMode = "create" | "edit" | "join-project" | "archive";

export type ProjectModalState = {
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
      style={{
        maxWidth: "45vw",
        marginLeft: "auto",
        marginRight: "auto",
      }}
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
  return <DialogTitle sx={{ fontWeight: "bold" }}>{titles[mode]}</DialogTitle>;
};

ProjectModal.Fields = ({ children }: { children: ReactNode }) => {
  return (
    <DialogContent dividers>
      <Stack spacing={2} sx={{ mt: 1 }}>
        {children}
      </Stack>
    </DialogContent>
  );
};

ProjectModal.ProjectID = ({
  projectID,
  visible,
}: {
  projectID: number;
  visible: boolean;
}) => {
  if (visible)
    return (
      <TextField
        label="Project ID"
        value={projectID}
        disabled
        fullWidth
        size="small"
      />
    );
  else return <></>;
};

ProjectModal.ProjectTitle = ({
  title,
  onTitleChange,
}: {
  title: string;
  onTitleChange: (title: string) => void;
}) => {
  return (
    <TextField
      label="Title"
      value={title}
      onChange={(e) => onTitleChange(e.target.value)}
      fullWidth
      size="small"
    />
  );
};

ProjectModal.ProjectDescription = ({
  description,
  onDescriptionChange,
}: {
  description: string;
  onDescriptionChange: (description: string) => void;
}) => {
  return (
    <TextField
      label="Description"
      value={description}
      onChange={(e) => onDescriptionChange(e.target.value)}
      multiline
      rows={3}
      fullWidth
      size="small"
    />
  );
};

ProjectModal.ArchiveWarning = () => (
  <Alert severity="warning">
    <strong>Warning:</strong> Archiving this project will remove it from the
    list
  </Alert>
);

ProjectModal.Actions = ({
  mode,
  disabled,
  handleCancelClick,
  handleCreateProject,
  handleEditProject,
  handleArchiveProject,
  handleJoinProject,
}: {
  mode: ModalMode;
  disabled: boolean;
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
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={handleCancelClick} color="inherit">
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={actions[mode]}
        color={mode === "archive" ? "error" : "primary"}
        disabled={disabled}
      >
        {labels[mode]}
      </Button>
    </DialogActions>
  );
};
