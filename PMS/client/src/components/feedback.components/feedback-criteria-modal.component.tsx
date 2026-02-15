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
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import type { FeedbackCriterion, FeedbackCriterionModal } from "../../lib/types";

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

FeedbackModal.Header = () => (
  <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
    Provide Deliverable Feedback
  </DialogTitle>
);

FeedbackModal.Content = ({ children }: { children: ReactNode }) => (
  <DialogContent dividers>
    <Stack spacing={3} sx={{ mt: 1 }}>
      {children}
    </Stack>
  </DialogContent>
);

FeedbackModal.CriteriaList = ({
  criteria,
  onCriterionDescriptionChange,
  onCriterionDelete,
}: {
  criteria: FeedbackCriterionModal[];
  onCriterionDescriptionChange: (
    updatedCriterion: Partial<FeedbackCriterionModal>,
  ) => void;
  onCriterionDelete: (deletedCriterion: Partial<FeedbackCriterionModal>) => void;
}) => {
  const handleDescriptionChange =
    (criterion: Partial<FeedbackCriterionModal>) => (updatedDescription: string) => {
      onCriterionDescriptionChange({ ...criterion, description: updatedDescription });
    };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="textSecondary">
        Required Changes / Criteria
      </Typography>

      {criteria.map((criterion, index) => (
        <FeedbackModal.CriterionInput
          key={criterion.feedbackCriterionID ?? index}
          index={index}
          description={criterion.description ?? ""}
          updateStatus={criterion.updateStatus}
          onDescriptionChange={handleDescriptionChange(criterion)}
          onDelete={() => onCriterionDelete(criterion)}
        />
      ))}

      {criteria.length === 0 && (
        <Typography
          variant="body2"
          sx={{ fontStyle: "italic", color: "gray", textAlign: "center", py: 2 }}>
          No feedback criteria added yet.
        </Typography>
      )}
    </Stack>
  );
};

FeedbackModal.CriterionInput = ({
  index,
  description,
  updateStatus,
  onDescriptionChange,
  onDelete,
}: {
  index: number;
  description: string;
  updateStatus: FeedbackCriterionModal["updateStatus"];
  onDescriptionChange: (updatedDescription: string) => void;
  onDelete: () => void;
}) => {
  const [localText, setLocalText] = useState(description ?? "");

  useEffect(() => {
    setLocalText(description);
  }, [description]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        opacity: updateStatus == "deleted" ? 0.4 : 1,
        transition: "opacity 0.2s ease",
      }}>
      <Typography
        sx={{
          mt: 1,
          fontWeight: "bold",
          minWidth: "20px",
          color: updateStatus == "deleted" ? "text.disabled" : "text.primary",
        }}>
        {index + 1}.
      </Typography>

      <FormControl fullWidth>
        <TextField
          fullWidth
          multiline
          size="small"
          disabled={updateStatus == "deleted"}
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={() => {
            if (localText !== description) onDescriptionChange(localText);
          }}
          sx={{
            "& .MuiInputBase-input": {
              textDecoration: updateStatus == "deleted" ? "line-through" : "none",
            },
            "& .MuiOutlinedInput-root": {
              backgroundColor: updateStatus == "deleted" ? "action.hover" : "transparent",
            },
          }}
        />
      </FormControl>

      <IconButton
        color="error"
        onClick={onDelete}
        disabled={updateStatus == "deleted"}
        sx={{
          mt: 0.5,
          visibility: updateStatus == "deleted" ? "hidden" : "visible",
        }}>
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

FeedbackModal.AddButton = ({ onAdd }: { onAdd: () => void }) => (
  <Button
    startIcon={<AddIcon />}
    variant="outlined"
    size="small"
    onClick={onAdd}
    sx={{ alignSelf: "flex-start", ml: 4 }}>
    Add Criterion
  </Button>
);

FeedbackModal.Actions = ({
  hasPreviousCriteria,
  onCancel,
  onSubmit,
  disabled,
}: {
  hasPreviousCriteria: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}) => (
  <DialogActions sx={{ p: 2, px: 3 }}>
    <Button onClick={onCancel} color="inherit">
      Cancel
    </Button>
    <Button variant="contained" onClick={onSubmit} disabled={disabled} color="primary">
      {hasPreviousCriteria ? "Update" : "Submit"}
    </Button>
  </DialogActions>
);
