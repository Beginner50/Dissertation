import type { Theme } from "@emotion/react";
import {
  Paper,
  Button,
  Divider,
  Typography,
  Stack,
  List,
  type SxProps,
  CircularProgress,
  Box,
} from "@mui/material";
import { Add, GroupAdd } from "@mui/icons-material";
import { type ReactNode } from "react";
import type { Project, User } from "../../lib/types";
import ProjectListEntry from "./project-list-entry.component";

export function ProjectList({
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
        flexGrow: 1,
        bgcolor: "background.paper",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        ...sx,
      }}>
      {children}
    </Paper>
  );
}

ProjectList.Header = ({ children }: { children?: ReactNode }) => {
  return (
    <header>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 1.5 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
          My Projects
        </Typography>

        <Stack direction="row" spacing={1.5}>
          {children}
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />
    </header>
  );
};

ProjectList.CreateProjectButton = ({
  handleCreateProjectClick,
}: {
  handleCreateProjectClick: () => void;
}) => {
  return (
    <Button
      variant="contained"
      color="primary"
      disableElevation
      startIcon={<Add />}
      onClick={handleCreateProjectClick}>
      Create Project
    </Button>
  );
};

ProjectList.JoinProjectButton = ({
  handleJoinProjectClick,
}: {
  handleJoinProjectClick: () => void;
}) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      disableElevation
      startIcon={<GroupAdd />}
      onClick={handleJoinProjectClick}>
      Join Project
    </Button>
  );
};

ProjectList.Content = ({ children }: { children: ReactNode }) => (
  <List disablePadding sx={{ overflow: "visible" }}>
    {children}
  </List>
);

ProjectList.Loading = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
    <CircularProgress size={32} />
  </Box>
);

ProjectList.NotFound = ({ message }: { message: string }) => (
  <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
    {message}
  </Typography>
);
