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
import type { FeedbackCriterion } from "../../lib/types";

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
  criteria: Partial<FeedbackCriterion>[];
  onCriterionDescriptionChange: (updatedCriterion: Partial<FeedbackCriterion>) => void;
  onCriterionDelete: (deletedCriterion: Partial<FeedbackCriterion>) => void;
}) => {
  const handleDescriptionChange =
    (criterion: Partial<FeedbackCriterion>) => (updatedDescription: string) => {
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
  onDescriptionChange,
  onDelete,
}: {
  index: number;
  description: string;
  onDescriptionChange: (updatedDescription: string) => void;
  onDelete: () => void;
}) => {
  const [localText, setLocalText] = useState(description ?? "");
  useEffect(() => {
    setLocalText(description);
  }, [description]);

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
      <Typography sx={{ mt: 1, fontWeight: "bold", minWidth: "20px" }}>
        {index + 1}.
      </Typography>

      <FormControl fullWidth>
        <TextField
          fullWidth
          multiline
          size="small"
          placeholder="Describe what needs to be fixed..."
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={() => {
            if (localText !== description) onDescriptionChange(localText);
          }}
        />
      </FormControl>

      <IconButton
        color="error"
        onClick={onDelete}
        sx={{ mt: 0.5 }}
        title="Delete criterion">
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
  onCancel,
  onSubmit,
  disabled,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}) => (
  <DialogActions sx={{ p: 2, px: 3 }}>
    <Button onClick={onCancel} color="inherit">
      Cancel
    </Button>
    <Button variant="contained" onClick={onSubmit} disabled={disabled} color="primary">
      Submit Feedback
    </Button>
  </DialogActions>
);
