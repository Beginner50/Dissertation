import { Description, Download, Delete } from "@mui/icons-material";
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

export default function DeliverableCard({
  cardDescription,
  url,
  deliverable,
  onRemove,
  sx,
}: {
  cardDescription: string;
  url: string;
  deliverable: Deliverable;
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
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <DeliverableCard.FileIcon isStaged={isStaged} />

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <DeliverableCard.Status isStaged={isStaged} />
            <DeliverableCard.FileName filename={deliverable.filename} />
            <DeliverableCard.Date timestamp={deliverable.submissionTimestamp} />
          </Box>

          <DeliverableCard.Actions
            url={url}
            filename={deliverable.filename}
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
    }}
  >
    <Description />
  </Avatar>
);

DeliverableCard.Status = ({ isStaged }: { isStaged: boolean }) => (
  <Typography
    variant="caption"
    color={isStaged ? "warning.dark" : "primary.main"}
    fontWeight={800}
    display="block"
  >
    {isStaged ? "Staged" : "Submitted"}
  </Typography>
);

DeliverableCard.FileName = ({ filename }: { filename: string }) => (
  <Typography variant="body2" fontWeight={600} noWrap title={filename}>
    {filename}
  </Typography>
);

DeliverableCard.Date = ({ timestamp }: { timestamp: string }) => (
  <Typography variant="caption" color="text.secondary">
    {new Date(timestamp).toLocaleDateString("en-GB")}
  </Typography>
);

DeliverableCard.Actions = ({
  url,
  filename,
  onRemove,
}: {
  url: string;
  filename: string;
  onRemove?: () => void;
}) => {
  return (
    <Stack>
      {onRemove && (
        <IconButton size="small" onClick={onRemove} color="error">
          <Delete fontSize="small" />
        </IconButton>
      )}

      <IconButton size="small" component="a" href={url} download={filename}>
        <Download fontSize="small" />
      </IconButton>
    </Stack>
  );
};
