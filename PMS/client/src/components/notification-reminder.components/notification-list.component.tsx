import type { Theme } from "@emotion/react";
import { Box, Divider, Stack, Typography, type SxProps } from "@mui/material";
import type { Notification } from "../../lib/types";
import NotificationEntry from "./notification-list-entry.component";
import type { ReactNode } from "react";

export function NotificationList({
  notifications,
  sx,
}: {
  notifications: Notification[];
  sx?: SxProps<Theme>;
}) {
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Box
      sx={{
        width: "28.5vw",
        padding: "1rem",
        background: "white",
        borderRadius: "8px",
        overflowY: "auto",
        ...sx,
      }}
    >
      <NotificationList.Header />

      <Stack spacing={0}>
        {sortedNotifications && sortedNotifications.length > 0 ? (
          sortedNotifications.map((notif) => (
            <NotificationEntry
              key={notif.notificationID}
              timestamp={notif.timestamp}
            >
              <NotificationEntry.Icon type={notif.type} />

              <NotificationEntry.Content>
                <NotificationEntry.Description text={notif.description} />
                <NotificationEntry.Time timestamp={notif.timestamp} />
              </NotificationEntry.Content>
            </NotificationEntry>
          ))
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.disabled">
              No new notifications
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

NotificationList.Header = ({ children }: { children?: ReactNode }) => {
  return (
    <header>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 1.5 }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
          Notifications
        </Typography>

        <Stack direction="row" spacing={1.5}>
          {children}
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />
    </header>
  );
};
