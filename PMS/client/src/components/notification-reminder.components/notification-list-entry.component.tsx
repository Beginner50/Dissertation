import { theme } from "../../lib/theme";
import type { Notification } from "../../lib/types";
import { ListItem, Typography, Box, Stack, type SxProps } from "@mui/material";
import { Event, Assignment } from "@mui/icons-material";
import type { ReactNode } from "react";

export default function NotificationEntry({
  timestamp,
  children,
  sx,
}: {
  timestamp: Date;
  children: ReactNode;
  sx?: SxProps;
}) {
  const opacity = (() => {
    const diffInMs = new Date().getTime() - timestamp.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) return 1;
    if (diffInDays < 7) return 0.85;
    if (diffInDays < 30) return 0.7;
  })();

  return (
    <ListItem
      sx={{
        py: 1,
        px: 2,
        mb: 1,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: "background.paper",
        opacity: opacity,
        border: "1px solid",
        borderColor: "divider",
        ...sx,
      }}>
      {children}
    </ListItem>
  );
}

NotificationEntry.Icon = ({ type }: { type: Notification["type"] }) => {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: `${type == "meeting" ? theme.link : "#2e7d32"}10`,
        color: type == "meeting" ? theme.link : "#2e7d32",
        flexShrink: 0,
      }}>
      {type == "meeting" ? (
        <Event sx={{ fontSize: 16 }} />
      ) : (
        <Assignment sx={{ fontSize: 16 }} />
      )}
    </Box>
  );
};

NotificationEntry.Content = ({ children }: { children: ReactNode }) => (
  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
    <Stack spacing={-0.2}>{children}</Stack>
  </Box>
);

NotificationEntry.Description = ({ text }: { text: string }) => (
  <Typography
    variant="body2"
    sx={{
      fontWeight: 700,
      color: "inherit",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "block",
    }}>
    {text}
  </Typography>
);

NotificationEntry.Time = ({ timestamp }: { timestamp: Date }) => {
  return (
    <Typography
      variant="caption"
      sx={{
        color: "text.disabled",
        fontWeight: 500,
        fontSize: "0.7rem",
      }}>
      {timestamp.toLocaleString("en-US")}
    </Typography>
  );
};
