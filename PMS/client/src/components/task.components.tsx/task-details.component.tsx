import { type ReactNode } from "react";
import { theme } from "../../lib/theme";
import { Box, Typography, type SxProps } from "@mui/material";
import type { Theme } from "@emotion/react";
import { displayISODate } from "../../lib/utils";

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
        maxHeight: "78vh",
        boxShadow: theme.shadowSoft,
        ...sx,
      }}>
      {children}
    </Box>
  );
}

TaskDetails.Header = ({ title, dueDate }: { title: string; dueDate: string }) => {
  return (
    <Box
      sx={{
        marginBottom: "15px",
        paddingBottom: "10px",
        borderBottom: `1px solid ${theme.borderSoft}`,
      }}>
      <Typography
        variant="h1"
        component="h1"
        sx={{ fontSize: "1.5rem", fontWeight: 700, color: theme.textStrong }}>
        {title}
      </Typography>
      <Typography
        component="p"
        sx={{ fontSize: "0.9rem", color: theme.textMuted, marginTop: "4px" }}>
        Due Date:{" "}
        <Box component="strong" sx={{ color: theme.textStrong }}>
          {displayISODate(dueDate)}
        </Box>
      </Typography>
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

TaskDetails.Description = ({ children: description }: { children: ReactNode }) => {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography component="p" sx={{ color: theme.textNormal, lineHeight: 1.6 }}>
        {description}
      </Typography>
    </Box>
  );
};
