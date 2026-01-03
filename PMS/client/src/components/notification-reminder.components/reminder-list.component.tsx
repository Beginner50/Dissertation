import type { Theme } from "@emotion/react";
import {
  Box,
  Divider,
  List,
  Stack,
  Typography,
  type SxProps,
} from "@mui/material";
import { theme } from "../../lib/theme";
import type { Reminder } from "../../lib/types";
import ReminderEntry from "./reminder-entry.component";
import type { ReactNode } from "react";

export function ReminderList({
  reminders,
  sx,
}: {
  reminders: Reminder[];
  sx?: SxProps<Theme> | undefined;
}) {
  return (
    <Box
      sx={{
        padding: "1rem",
        background: "white",
        borderRadius: "8px",
        overflowY: "auto",
        border: `1px solid ${theme.borderSoft}`,
        boxShadow: theme.shadowSoft,
        ...sx,
      }}
    >
      <ReminderList.Header />

      <Stack>
        {reminders && reminders.length > 0 ? (
          reminders?.map((reminder) => (
            <ReminderEntry>
              <ReminderEntry.Icon type={reminder.type} />

              <ReminderEntry.Content>
                <ReminderEntry.Time remindAt={reminder.remindAt} />
                <ReminderEntry.Description text={reminder.message} />
              </ReminderEntry.Content>
            </ReminderEntry>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
            No Reminders yet.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

ReminderList.Header = ({ children }: { children?: ReactNode }) => {
  return (
    <header>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 1.5 }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
          Reminders
        </Typography>

        <Stack direction="row" spacing={1.5}>
          {children}
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />
    </header>
  );
};
