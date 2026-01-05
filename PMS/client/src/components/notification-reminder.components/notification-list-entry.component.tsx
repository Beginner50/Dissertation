import { theme } from "../../lib/theme";
import type { Notification } from "../../lib/types";
import { ListItem, Typography, Box, Stack, type SxProps } from "@mui/material";
import { Event, Assignment } from "@mui/icons-material";
import type { ReactNode } from "react";

const getNotificationAgeStyle = (timestamp: string) => {
  const now = new Date("2026-01-03T22:14:47");
  const then = new Date(timestamp);
  const diffInMs = now.getTime() - then.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInDays < 1) return { opacity: 1, grayness: "text.primary" };
  if (diffInDays < 7) return { opacity: 0.85, grayness: "text.secondary" };
  if (diffInDays < 30) return { opacity: 0.7, grayness: "text.secondary" };
  return { opacity: 0.5, grayness: "text.disabled" };
};

const getTypeMeta = (type: Notification["type"]) => {
  return type === "meeting"
    ? { color: theme.link || "#1976d2", icon: <Event sx={{ fontSize: 16 }} /> }
    : { color: "#2e7d32", icon: <Assignment sx={{ fontSize: 16 }} /> };
};

export default function NotificationEntry({
  timestamp,
  children,
  sx,
}: {
  timestamp: string;
  children: ReactNode;
  sx?: SxProps;
}) {
  const { opacity } = getNotificationAgeStyle(timestamp);

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
      }}
    >
      {children}
    </ListItem>
  );
}

NotificationEntry.Icon = ({ type }: { type: Notification["type"] }) => {
  const { color, icon } = getTypeMeta(type);
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: `${color}10`,
        color: color,
        flexShrink: 0,
      }}
    >
      {icon}
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
    }}
  >
    {text}
  </Typography>
);

NotificationEntry.Time = ({ timestamp }: { timestamp: string }) => {
  const dateObj = new Date(timestamp);
  return (
    <Typography
      variant="caption"
      sx={{
        color: "text.disabled",
        fontWeight: 500,
        fontSize: "0.7rem",
      }}
    >
      {dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </Typography>
  );
};
