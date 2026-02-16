import { Description, Download, Delete, RemoveRedEye } from "@mui/icons-material";
import {
  Card,
  Avatar,
  IconButton,
  Stack,
  Typography,
  type SxProps,
  Box,
} from "@mui/material";
import type { Deliverable } from "../../lib/types";
import { theme } from "../../lib/theme";
import { toLocalDateString } from "../../lib/utils";

export default function DeliverableCard({
  cardDescription,
  deliverable,
  onOpenDeliverable,
  onRemove,
  sx,
}: {
  cardDescription: string;
  deliverable: Deliverable;
  onOpenDeliverable: () => void;
  onRemove?: () => void;
  sx?: SxProps;
}) {
  const isStaged = cardDescription.toLowerCase().includes("staged");

  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: isStaged ? theme.borderSoft : "hsl(0,0%,100%)",
        borderColor: theme.borderNormal,
        ...sx,
      }}>
      <Box sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <DeliverableCard.FileIcon isStaged={isStaged} />

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <DeliverableCard.Status isStaged={isStaged} />
            <DeliverableCard.FileName filename={deliverable.filename} />
            <DeliverableCard.Date timestamp={deliverable.submissionTimestamp} />
          </Box>

          <DeliverableCard.Actions
            filename={deliverable.filename}
            onOpenDeliverable={onOpenDeliverable}
            onRemove={onRemove}
          />
        </Stack>
      </Box>
    </Card>
  );
}

DeliverableCard.FileIcon = ({ isStaged }: { isStaged: boolean }) => (
  <Avatar
    sx={{
      bgcolor: isStaged ? "warning.main" : "primary.main",
      width: 40,
      height: 40,
    }}>
    <Description />
  </Avatar>
);

DeliverableCard.Status = ({ isStaged }: { isStaged: boolean }) => (
  <Typography
    variant="caption"
    color={isStaged ? "warning.dark" : "primary.main"}
    fontWeight={800}
    display="block">
    {isStaged ? "Staged" : "Submitted"}
  </Typography>
);

DeliverableCard.FileName = ({ filename }: { filename: string }) => (
  <Typography variant="body2" fontWeight={600} noWrap title={filename}>
    {filename}
  </Typography>
);

DeliverableCard.Date = ({ timestamp }: { timestamp: Date }) => (
  <Typography variant="caption" color="text.secondary">
    {toLocalDateString(timestamp)}
  </Typography>
);

DeliverableCard.Actions = ({
  filename,
  onOpenDeliverable,
  onRemove,
}: {
  filename: string;
  onOpenDeliverable: () => void;
  onRemove?: () => void;
}) => {
  return (
    <Stack>
      {onRemove && (
        <IconButton size="small" onClick={onRemove} color="error">
          <Delete fontSize="small" />
        </IconButton>
      )}

      <IconButton size="small" onClick={onOpenDeliverable}>
        <RemoveRedEye fontSize="small" />
      </IconButton>
    </Stack>
  );
};
