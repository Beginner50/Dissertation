import { theme } from "../../lib/theme";
import type { Reminder } from "../../lib/types";
import { ListItem, Typography, Box, Stack, type SxProps } from "@mui/material";
import { Event, Assignment } from "@mui/icons-material";
import type { ReactNode } from "react";
import { toLocalDateString, toLocalTimeString } from "../../lib/utils";

const getReminderTypeMeta = (type: Reminder["type"]) => {
  switch (type) {
    case "meeting":
      return {
        color: theme.link || "#1976d2",
        icon: <Event fontSize="small" />,
      };
    case "task":
      return { color: "#2e7d32", icon: <Assignment fontSize="small" /> };
    default:
      return { color: theme.textMuted, icon: <Event fontSize="small" /> };
  }
};

export default function ReminderEntry({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps;
}) {
  return (
    <ListItem
      sx={{
        mb: 1.5,
        p: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 2,
        ...sx,
      }}>
      {children}
    </ListItem>
  );
}

ReminderEntry.Icon = ({ type }: { type: Reminder["type"] }) => {
  const { color, icon } = getReminderTypeMeta(type);
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: `${color}12`,
        color: color,
        flexShrink: 0,
      }}>
      {icon}
    </Box>
  );
};

ReminderEntry.Content = ({ children }: { children: ReactNode }) => (
  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
    <Stack spacing={0.2}>{children}</Stack>
  </Box>
);

ReminderEntry.Time = ({ remindAt }: { remindAt: Date }) => {
  return (
    <Typography
      variant="body1"
      sx={{
        fontWeight: 800,
        color: "text.primary",
        lineHeight: 1.2,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}>
      {toLocalTimeString(remindAt)}
      <Typography
        component="span"
        variant="caption"
        sx={{ color: "text.disabled", fontWeight: 600, mt: 0.2 }}>
        • {toLocalDateString(remindAt)}
      </Typography>
    </Typography>
  );
};

ReminderEntry.Description = ({ text }: { text: string }) => (
  <Typography
    variant="body2"
    sx={{
      color: "text.secondary",
      fontWeight: 500,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "block",
    }}>
    {text}
  </Typography>
);
