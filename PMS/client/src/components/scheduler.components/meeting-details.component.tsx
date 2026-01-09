import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Edit, Save, Close, Event, Person, AccessTime, Info } from "@mui/icons-material";
import { useEffect, useState, type ReactNode } from "react";
import type { Meeting } from "../../lib/types";

export function MeetingDetails({ children }: { children: ReactNode }) {
  return <Box sx={{ p: 2 }}>{children}</Box>;
}

MeetingDetails.Header = ({ title }: { title: string }) => (
  <Typography variant="h6" gutterBottom color="primary.main" sx={{ fontWeight: 600 }}>
    {title}
  </Typography>
);

MeetingDetails.InfoRow = ({
  icon,
  label,
  value,
  valueColor = "text.primary",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 80 }}>
      {label}:
    </Typography>
    <Typography variant="body2" sx={{ color: valueColor }}>
      {value}
    </Typography>
  </Stack>
);

MeetingDetails.Status = ({ status }: { status: Meeting["status"] }) => (
  <MeetingDetails.InfoRow
    icon={<Info fontSize="small" />}
    label="Status"
    value={status.charAt(0).toUpperCase() + status.slice(1)}
    valueColor={status === "accepted" ? "success.main" : "error.main"}
  />
);

MeetingDetails.Description = ({
  description,
  isMeetingParticipant,
  handleUpdateDescription,
}: {
  description: string;
  isMeetingParticipant: boolean;
  handleUpdateDescription: (description: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState(description);

  useEffect(() => {
    setTempDescription(description);
  }, [description]);

  const handleSave = () => {
    handleUpdateDescription(tempDescription);
    setIsEditing(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Description
        </Typography>
        {!isEditing && isMeetingParticipant && (
          <IconButton size="small" onClick={() => setIsEditing(true)}>
            <Edit fontSize="small" />
          </IconButton>
        )}
      </Stack>

      {isEditing ? (
        <Stack spacing={1} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              color="inherit"
              onClick={() => setIsEditing(false)}
              startIcon={<Close />}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
              startIcon={<Save />}>
              Save
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, fontStyle: description ? "normal" : "italic" }}>
          {description || "No description provided."}
        </Typography>
      )}
    </Box>
  );
};
