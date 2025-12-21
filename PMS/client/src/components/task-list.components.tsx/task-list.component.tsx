import {
  Box,
  Divider,
  IconButton,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import { theme } from "../../lib/theme";
import type { Task } from "../../lib/types";
import {
  CompletedVariant1,
  MissingVariant1,
  PendingVariant1,
} from "../base.components/status-tags.component";
import { type ReactNode } from "react";
import { Link } from "react-router";
import { MoreVert } from "@mui/icons-material";

const mockTasks: Task[] = [
  {
    id: 501,
    title: "Finalize Component Architecture",
    status: "pending",
    deadline: "2026-01-15",
    projectID: 101,
  },
  {
    id: 503,
    title: "Review Security Audit Report",
    status: "completed",
    deadline: "2025-12-05",
    projectID: 101,
  },
  {
    id: 504,
    title: "Implement UI/UX Feedback Loop",
    status: "missing",
    deadline: "2025-01-20",
    projectID: 101,
  },
  {
    id: 502,
    title: "Set up CI/CD Pipeline",
    status: "completed",
    deadline: "2025-12-05",
    projectID: 101,
  },
];

export function TaskList({
  children,
  sx,
}: {
  children?: ReactNode;
  sx?: SxProps<Theme> | undefined;
}) {
  return (
    <Box
      sx={{
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        background: "white",
        borderColor: theme.borderSoft,
        borderRadius: "8px",
        borderStyle: "solid",
        borderWidth: "1px",
        boxShadow: theme.shadowSoft,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

TaskList.Header = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          paddingBottom: "0.5rem",
        }}
      >
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
          }}
        >
          Project Tasks
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: "10px",
          }}
        >
          {children}
        </Box>
      </Box>

      <Divider sx={{ marginBottom: "0.7rem" }} />
    </>
  );
};

TaskList.Content = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {mockTasks.map((task) => {
        return (
          <TaskList.ListEntry
            key={task.id}
            title={task.title}
            url={`/projects/${task.projectID}/tasks/${task.id}`}
            dueDate={task.deadline}
            status={task.status}
          />
        );
      })}
    </Box>
  );
};

TaskList.ListEntry = ({
  status,
  title,
  dueDate,
  url,
}: {
  status: string;
  title: string;
  dueDate: string;
  url: string;
}) => {
  const deadline = new Date(dueDate);
  const isDeadlinePast =
    !Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "10px 12px",
        marginBottom: "8px",
        background: "hsl(0,0%,99.5%)",
        borderRadius: "8px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.borderNormal,
        boxShadow: theme.shadowMuted,
        transition:
          "box-shadow 0.2s, border-color 0.2s, opacity 0.3s, transform 0.1s",
        gap: "14px",

        "&:hover": {
          borderColor: theme.borderNormal,
          boxShadow: theme.shadowSoft,
        },
      }}
    >
      {status === "completed" ? (
        <CompletedVariant1 />
      ) : status === "missing" ? (
        <MissingVariant1 />
      ) : (
        <PendingVariant1 />
      )}

      <Box
        sx={{
          flexGrow: 1,
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Link to={url} style={{ textDecoration: "none" }}>
          <Typography
            component="span"
            sx={{
              textDecoration: "none",
              color: theme.link,
              fontWeight: 600,
              fontSize: "1rem",
              transition: "color 0.2s",
              "&:hover": {
                color: theme.linkFocused,
                textDecoration: "underline",
              },
            }}
          >
            {title}
          </Typography>
        </Link>

        <Typography
          component="span"
          sx={{
            fontSize: "0.85rem",
            color: theme.textNormal,
            textDecoration: isDeadlinePast ? "line-through" : "none",
          }}
        >
          Deadline:{" "}
          {isDeadlinePast ? (
            dueDate
          ) : (
            <strong style={{ fontWeight: 600 }}>{dueDate}</strong>
          )}
        </Typography>
      </Box>

      <IconButton>
        <MoreVert fontSize="inherit" />
      </IconButton>
    </Box>
  );
};
