import type { ReactNode } from "react";
import { theme } from "../../lib/theme";
import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";

export default function SchedulerActions({ children }: { children?: ReactNode }) {
  return (
    <Box
      sx={{
        padding: "1rem",
        background: "white",
        borderRadius: "8px",
        borderColor: theme.borderSoft,
        borderStyle: "solid",
        borderWidth: "1px",
        boxShadow: theme.shadowSoft,
        flexGrow: 1,
        minWidth: "300px",
      }}>
      {children}
    </Box>
  );
}

SchedulerActions.Header = ({ title }: { title: string }) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          paddingBottom: "0.5rem",
        }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: "1.2rem",
            fontFamily: "sans-serif",
            fontWeight: 600,
            color: "black",
            margin: 0,
            padding: "2px",
            alignSelf: "end",
          }}>
          {title}
        </Typography>
      </Box>
      <Divider
        sx={{
          marginBottom: "0.7rem",
        }}
      />
    </>
  );
};

SchedulerActions.BookedMeetingActions = ({
  isLoading,
  isOrganizer,
  isAttendee,
  handleCancel,
  handleAccept,
  handleReject,
}: {
  isLoading: boolean;
  isOrganizer: boolean;
  isAttendee: boolean;
  handleCancel: () => void;
  handleAccept: () => void;
  handleReject: () => void;
}) => {
  if (isOrganizer)
    return (
      <Button
        variant="contained"
        color="error"
        loading={isLoading}
        onClick={handleCancel}
        fullWidth>
        Cancel Meeting
      </Button>
    );
  else if (isAttendee)
    return (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="success"
          loading={isLoading}
          onClick={handleAccept}>
          Accept
        </Button>
        <Button
          variant="outlined"
          color="error"
          loading={isLoading}
          onClick={handleReject}>
          Reject
        </Button>
      </Stack>
    );
  return <></>;
};
