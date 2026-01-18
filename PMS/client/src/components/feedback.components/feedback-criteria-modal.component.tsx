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
import type { FeedbackCriteria } from "../../lib/types";

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
  criteria: Partial<FeedbackCriteria>[];
  onCriterionDescriptionChange: (updated: Partial<FeedbackCriteria>) => void;
  onCriterionDelete: (criterionToDelete: Partial<FeedbackCriteria>) => void;
}) => {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="textSecondary">
        Required Changes / Criteria
      </Typography>

      {criteria.map((item, index) => (
        <FeedbackModal.CriterionInput
          key={index}
          index={index}
          item={item}
          onDescriptionChange={onCriterionDescriptionChange}
          onDelete={onCriterionDelete}
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
  item,
  onDescriptionChange,
  onDelete,
}: {
  index: number;
  item: Partial<FeedbackCriteria>;
  onDescriptionChange: (updated: Partial<FeedbackCriteria>) => void;
  onDelete: (item: Partial<FeedbackCriteria>) => void;
}) => {
  const [localText, setLocalText] = useState(item.description ?? "");

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
            if (localText !== item.description) {
              onDescriptionChange({ ...item, description: localText });
            }
          }}
        />
      </FormControl>

      <IconButton
        color="error"
        onClick={() => onDelete(item)}
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
