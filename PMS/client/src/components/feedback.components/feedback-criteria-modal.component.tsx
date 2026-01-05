import { type ReactNode } from "react";
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

// The specific type you provided
export type FeedbackCriteria = {
  feedbackCriteriaID: number;
  description: string;
  status: "met" | "unmet" | "overridden";
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
      keepMounted
    >
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
  onUpdateCriteria,
}: {
  criteria: FeedbackCriteria[];
  onUpdateCriteria: (newCriteria: FeedbackCriteria[]) => void;
}) => {
  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...criteria];
    // Update only the description property
    updated[index] = { ...updated[index], description: value };
    onUpdateCriteria(updated);
  };

  const removeCriterion = (index: number) => {
    onUpdateCriteria(criteria.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">
        Required Changes / Criteria
      </Typography>
      {criteria.map((item, index) => (
        <Box
          key={index}
          sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
        >
          {/* Numbered list based on index */}
          <Typography sx={{ mt: 1, fontWeight: "bold", minWidth: "20px" }}>
            {index + 1}.
          </Typography>

          <FormControl fullWidth>
            <TextField
              fullWidth
              multiline
              size="small"
              placeholder="Describe what needs to be fixed..."
              value={item.description}
              onChange={(e) => handleDescriptionChange(index, e.target.value)}
            />
          </FormControl>

          <IconButton
            color="error"
            onClick={() => removeCriterion(index)}
            sx={{ mt: 0.5 }}
            title="Delete criterion"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      {criteria.length === 0 && (
        <Typography
          variant="body2"
          sx={{
            fontStyle: "italic",
            color: "gray",
            textAlign: "center",
            py: 2,
          }}
        >
          No feedback criteria added yet.
        </Typography>
      )}
    </Stack>
  );
};

FeedbackModal.AddButton = ({ onAdd }: { onAdd: () => void }) => (
  <Button
    startIcon={<AddIcon />}
    variant="outlined"
    size="small"
    onClick={onAdd}
    sx={{ alignSelf: "flex-start", ml: 4 }} // Align with the text fields
  >
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
    <Button
      variant="contained"
      onClick={onSubmit}
      disabled={disabled}
      color="primary"
    >
      Submit Feedback
    </Button>
  </DialogActions>
);
