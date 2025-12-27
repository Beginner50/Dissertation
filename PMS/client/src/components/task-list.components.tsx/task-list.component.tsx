import {
  Box,
  Button,
  Divider,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import { theme } from "../../lib/theme";
import type { Task, TaskFormData } from "../../lib/types";
import { type ReactNode } from "react";
import TaskListEntry from "./task-list-entry.component";

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

TaskList.List = ({
  projectID,
  tasks,
  handleEditTaskClick,
  handleDeleteTaskClick,
}: {
  projectID: number;
  tasks: Task[];
  handleEditTaskClick: (data: TaskFormData) => void;
  handleDeleteTaskClick: (data: TaskFormData) => void;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {tasks.map((task) => {
        return (
          <TaskListEntry key={task.taskID} status={task.status}>
            <TaskListEntry.Link
              title={task.title}
              url={`/projects/${projectID}/tasks/${task.taskID}`}
              dueDate={task.dueDate}
            />
            <TaskListEntry.MenuButton
              onEditButtonClick={() =>
                handleEditTaskClick({
                  taskID: task.taskID,
                  title: task.title,
                  description: task.description,
                  dueDate: task.dueDate,
                })
              }
              onDeleteButtonClick={() => {
                handleDeleteTaskClick({
                  taskID: task.taskID,
                  title: task.title,
                  description: task.description,
                  dueDate: task.dueDate,
                });
              }}
            />
          </TaskListEntry>
        );
      })}
    </Box>
  );
};

TaskList.CreateTaskButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button variant="contained" onClick={onClick}>
      Create Task
    </Button>
  );
};
