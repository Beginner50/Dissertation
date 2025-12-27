import { theme } from "../../lib/theme";
import type { Theme } from "@emotion/react";
import { Description, Download } from "@mui/icons-material";
import { Box, IconButton, Typography, type SxProps } from "@mui/material";
import type { Deliverable } from "../../lib/types";

export default function DeliverableCard({
  cardDescription,
  url,
  sx,
  deliverable,
}: {
  cardDescription: string;
  url: string;
  deliverable: Deliverable;
  sx?: SxProps<Theme> | undefined;
}) {
  return (
    <Box
      sx={{
        p: "12px",
        borderRadius: "8px",
        border: `1px solid ${theme.borderSoft}`,
        backgroundColor: "hsl(220, 13%, 97%)",
        flexShrink: 0,
        ...sx,
      }}
    >
      <Typography
        component="h3"
        sx={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: theme.textStrong,
          mb: 1,
        }}
      >
        {cardDescription}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* File Icon */}
        <Description
          sx={{ color: theme.textNormal, fontSize: "1.8rem", flexShrink: 0 }}
        />

        {/* File Info */}
        <Box sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden" }}>
          <Typography
            title={deliverable.filename}
            sx={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: theme.textStrong,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {deliverable.filename}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: theme.textMuted }}>
            {new Date(deliverable.submissionTimestamp).toLocaleDateString(
              "en-GB"
            )}
          </Typography>
        </Box>

        {/* Download Icon Button */}
        <IconButton
          size="small"
          component="a"
          href={url}
          download={deliverable.filename}
          title="Download Deliverable"
          sx={{ flexShrink: 0, color: theme.textNormal }}
        >
          <Download fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
