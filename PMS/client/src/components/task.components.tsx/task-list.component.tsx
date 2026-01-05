import {
  Paper,
  Button,
  Divider,
  Typography,
  Stack,
  List,
  type SxProps,
  type Theme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { type ReactNode } from "react";
import type { Task, TaskFormData } from "../../lib/types";
import TaskListEntry from "./task-list-entry.component";

export function TaskList({
  children,
  sx,
}: {
  children?: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        display: "flex",
        overflowY: "auto",
        flexDirection: "column",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

TaskList.Header = ({ children }: { children?: ReactNode }) => (
  <header>
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 1 }}
    >
      <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
        Project Tasks
      </Typography>

      <Stack direction="row" spacing={1}>
        {children}
      </Stack>
    </Stack>
    <Divider sx={{ mb: 2 }} />
  </header>
);

TaskList.Content = ({
  isLoading,
  projectID,
  tasks,
  menuEnabled,
  handleEditTaskClick,
  handleDeleteTaskClick,
}: {
  isLoading: boolean;
  projectID: number | string | undefined;
  tasks: Task[];
  menuEnabled: boolean;
  handleEditTaskClick: (data: TaskFormData) => void;
  handleDeleteTaskClick: (data: TaskFormData) => void;
}) => (
  <List disablePadding>
    {tasks.map((task) => (
      <TaskListEntry key={task.taskID} status={task.status}>
        <TaskListEntry.Link
          title={task.title}
          url={`/projects/${projectID}/tasks/${task.taskID}`}
          dueDate={task.dueDate}
        />
        {menuEnabled && (
          <TaskListEntry.MenuButton
            onEditButtonClick={() =>
              handleEditTaskClick({
                taskID: task.taskID,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
              })
            }
            onDeleteButtonClick={() =>
              handleDeleteTaskClick({
                taskID: task.taskID,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
              })
            }
          />
        )}
      </TaskListEntry>
    ))}
  </List>
);

TaskList.CreateTaskButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={onClick}
    disableElevation
  >
    Create Task
  </Button>
);
