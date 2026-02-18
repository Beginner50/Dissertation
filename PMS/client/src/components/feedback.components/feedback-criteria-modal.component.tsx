import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Button,
  FormControl,
  Typography,
  IconButton,
  Box,
  FormGroup,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import type { FeedbackCriterion, FeedbackCriterionModal } from "../../lib/types";
import { theme } from "../../lib/theme";
import { Check, Close, SyncAlt } from "@mui/icons-material";

export type ModalMode = "create" | "edit";
export type ModalState = {
  mode: ModalMode;
  open: boolean;
};

export default function FeedbackModal({
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
          sx: { maxWidth: "50vw", mx: "auto" },
        },
      }}
      keepMounted>
      {children}
    </Dialog>
  );
}

FeedbackModal.Header = ({ mode }: { mode: ModalMode }) => {
  const titles = {
    create: "Create Criterion",
    edit: "Edit Criterion",
  };

  return <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>{titles[mode]}</DialogTitle>;
};

FeedbackModal.Fields = ({ children }: { children: ReactNode }) => (
  <DialogContent dividers>
    <FormGroup>
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        {children}
      </Stack>
    </FormGroup>
  </DialogContent>
);

FeedbackModal.FeedbackCriterionID = ({
  feedbackCriterionID,
}: {
  feedbackCriterionID: number;
}) => (
  <TextField
    fullWidth
    label="Criterion ID"
    value={feedbackCriterionID}
    disabled
    variant="outlined"
    margin="normal"
    sx={{ "& .MuiInputBase-input": { fontFamily: "monospace" } }}
  />
);

FeedbackModal.Description = ({
  description,
  handleDescriptionChange,
}: {
  description: string;
  handleDescriptionChange: (val: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(description);

  useEffect(() => {
    setLocalValue(description);
  }, [description]);

  useEffect(() => {
    if (description == "") handleDescriptionChange(localValue);
  }, [localValue]);

  return (
    <TextField
      fullWidth
      label="Description"
      multiline
      rows={3}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => handleDescriptionChange(localValue)}
      variant="outlined"
      margin="normal"
      placeholder="Enter the feedback requirement..."
    />
  );
};

FeedbackModal.Status = ({
  status,
  handleStatusChange,
}: {
  status: "met" | "unmet" | "overridden";
  handleStatusChange: (val: "met" | "unmet" | "overridden") => void;
}) => (
  <Box sx={{ my: 2 }}>
    <Typography
      variant="caption"
      sx={{ color: "text.secondary", mb: 1, display: "block", fontWeight: 600 }}>
      Criterion Status
    </Typography>
    <ToggleButtonGroup
      value={status}
      exclusive
      onChange={(_, newValue) => newValue && handleStatusChange(newValue)}
      fullWidth
      size="small"
      sx={{ height: "40px" }}>
      <ToggleButton
        value="met"
        sx={{
          gap: 1,
          "&.Mui-selected": { color: theme.status.completed, bgcolor: "#e8f5e9" },
        }}>
        <Check fontSize="small" /> Met
      </ToggleButton>

      <ToggleButton
        value="unmet"
        sx={{
          gap: 1,
          "&.Mui-selected": { color: theme.status.missing, bgcolor: "#ffebee" },
        }}>
        <Close fontSize="small" /> Unmet
      </ToggleButton>

      <ToggleButton
        value="overridden"
        sx={{
          gap: 1,
          "&.Mui-selected": { color: theme.link, bgcolor: "#e3f2fd" },
        }}>
        <SyncAlt fontSize="small" /> Overridden
      </ToggleButton>
    </ToggleButtonGroup>
  </Box>
);

FeedbackModal.ChangeObserved = ({ changeObserved }: { changeObserved: string }) => (
  <TextField
    fullWidth
    label="AI Analysis / Observation"
    multiline
    rows={changeObserved == "" ? 1 : 4}
    value={changeObserved}
    disabled
    variant="outlined"
    margin="normal"
  />
);

FeedbackModal.Actions = ({
  mode,
  loading,
  disabled,
  handleCancelClick,
  handleCreate,
  handleEdit,
}: {
  mode: ModalMode;
  loading: boolean;
  disabled: boolean;
  handleCancelClick: () => void;
  handleCreate: () => void;
  handleEdit: () => void;
}) => {
  const labels = {
    create: "Create",
    edit: "Save",
  } as const;

  const actions: Record<Extract<ModalMode, "create" | "edit">, () => void> = {
    create: handleCreate,
    edit: handleEdit,
  };

  return (
    <DialogActions sx={{ p: 2, px: 3 }}>
      <Button onClick={handleCancelClick} color="inherit">
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={actions[mode]}
        color="primary"
        loading={loading}
        disabled={disabled}>
        {labels[mode]}
      </Button>
    </DialogActions>
  );
};
