import { type ReactNode } from "react";
import { theme } from "../../lib/theme";
import { Box, Stack, Tooltip, Typography, type SxProps } from "@mui/material";
import type { Theme } from "@emotion/react";
import { LockOpen, LockOutline, LockOutlined } from "@mui/icons-material";

export function TaskDetails({
  sx,
  children,
}: {
  sx?: SxProps<Theme> | undefined;
  children?: ReactNode;
}) {
  return (
    <Box
      sx={{
        padding: "1rem",
        background: "white",
        borderRadius: "8px",
        overflowY: "auto",
        border: `1px solid ${theme.borderSoft}`,
        display: "flex",
        flexDirection: "column",
        maxWidth: "65vw",
        maxHeight: "75.8vh",
        boxShadow: theme.shadowSoft,
        ...sx,
      }}>
      {children}
    </Box>
  );
}

TaskDetails.Header = ({
  title,
  dueDate,
  isLocked,
}: {
  title: string;
  dueDate: Date;
  isLocked: boolean;
}) => {
  return (
    <Box
      sx={{
        marginBottom: "15px",
        paddingBottom: "10px",
        borderBottom: `1px solid ${theme.borderSoft}`,
      }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{ fontSize: "1.5rem", fontWeight: 700, color: theme.textStrong }}>
            {title}
          </Typography>

          <Typography
            component="p"
            sx={{
              fontSize: "0.9rem",
              color: theme.textMuted,
              marginTop: "8px",
            }}>
            Due Date:{" "}
            <Box component="strong" sx={{ color: theme.textStrong }}>
              {dueDate.toLocaleString("en-US")}
            </Box>
          </Typography>
        </Box>

        <Tooltip title={isLocked ? "Task is locked" : "Task is open"}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: "50%",
              color: isLocked ? "secondary.main" : theme.status.completed,
              opacity: isLocked ? 1 : 0.6,
              transition: "all 0.3s ease",
            }}>
            {isLocked ? (
              <LockOutlined sx={{ fontSize: "1.8rem" }} />
            ) : (
              <LockOpen sx={{ fontSize: "1.8rem" }} />
            )}
          </Box>
        </Tooltip>
      </Stack>
    </Box>
  );
};

TaskDetails.Content = ({ children }: { children?: ReactNode }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "20px",
        marginBottom: "20px",
        flexDirection: { xs: "column", sm: "row" },
      }}>
      {children}
    </Box>
  );
};

TaskDetails.Description = ({ description }: { description: string }) => {
  const isEmpty = description === "";

  return (
    <Box sx={{ flex: 1, minWidth: 0, marginBottom: isEmpty ? "2rem" : undefined }}>
      <Typography component="p" sx={{ color: theme.textNormal, lineHeight: 1.6 }}>
        {isEmpty ? (
          <Box component="span" sx={{ fontStyle: "italic", color: theme.textMuted }}>
            No task description provided.
          </Box>
        ) : (
          description
        )}
      </Typography>
    </Box>
  );
};
