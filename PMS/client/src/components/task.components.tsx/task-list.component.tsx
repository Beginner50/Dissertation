import {
  Paper,
  Button,
  Divider,
  Typography,
  Stack,
  List,
  type SxProps,
  type Theme,
  CircularProgress,
  Box,
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
        flexDirection: "column",
        ...sx,
      }}>
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
      sx={{ mb: 1 }}>
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

TaskList.Content = ({ children }: { children: ReactNode }) => (
  <List disablePadding sx={{ overflow: "visible" }}>
    {children}
  </List>
);

TaskList.Loading = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
    <CircularProgress size={32} />
  </Box>
);

TaskList.NotFound = ({ message }: { message: string }) => (
  <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
    {message}
  </Typography>
);

TaskList.CreateTaskButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="contained" startIcon={<AddIcon />} onClick={onClick} disableElevation>
    Create Task
  </Button>
);
