import { theme } from "../../lib/theme";
import type { Reminder } from "../../lib/types";
import { ListItem, Typography, Box, Stack, type SxProps } from "@mui/material";
import { Event, Assignment } from "@mui/icons-material";
import type { ReactNode } from "react";

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
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: "hsl(0, 0%, 99%)",
        },
        ...sx,
      }}
    >
      {children}
    </ListItem>
  );
}

// 1. Icon Component
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
        bgcolor: `${color}12`, // Subtle 12% opacity background
        color: color,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
  );
};

// 2. Vertical Stack Wrapper
ReminderEntry.Content = ({ children }: { children: ReactNode }) => (
  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
    <Stack spacing={0.2}>{children}</Stack>
  </Box>
);

// 3. The Headline (Time + Date)
ReminderEntry.Time = ({ remindAt }: { remindAt: string }) => {
  const dateObj = new Date(remindAt);
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
      }}
    >
      {dateObj.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}
      <Typography
        component="span"
        variant="caption"
        sx={{ color: "text.disabled", fontWeight: 600, mt: 0.2 }}
      >
        •{" "}
        {dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })}
      </Typography>
    </Typography>
  );
};

// 4. The Subtext (Description)
ReminderEntry.Description = ({ text }: { text: string }) => (
  <Typography
    variant="body2"
    sx={{
      color: "text.secondary", // Grayer than the time
      fontWeight: 500,
      // Standard non-webkit truncation:
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "block",
    }}
  >
    {text}
  </Typography>
);
