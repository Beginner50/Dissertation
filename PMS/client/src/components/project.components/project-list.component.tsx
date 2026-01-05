import type { Theme } from "@emotion/react";
import {
  Paper,
  Button,
  Divider,
  Typography,
  Stack,
  List,
  type SxProps,
} from "@mui/material";
import { Add, AddCircleOutline, GroupAdd } from "@mui/icons-material";
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
        overflowY: "auto",
        flexDirection: "column",
        ...sx,
      }}
    >
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
        sx={{ mb: 1.5 }}
      >
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
      onClick={handleCreateProjectClick}
    >
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
      onClick={handleJoinProjectClick}
    >
      Join Project
    </Button>
  );
};

ProjectList.Content = ({
  isLoading,
  projects,
  menuEnabled,
  handleEditProjectClick,
  handleArchiveProjectClick,
}: {
  isLoading: boolean;
  projects: Project[];
  menuEnabled: boolean;
  handleEditProjectClick: (project: Project) => void;
  handleArchiveProjectClick: (project: Project) => void;
}) => {
  const activeProjects = projects.filter((p) => p.status === "active");

  return (
    <List disablePadding>
      {activeProjects.length > 0 ? (
        activeProjects.map((project) => (
          <ProjectListEntry key={project.projectID}>
            <ProjectListEntry.Link
              title={project.title}
              url={`/projects/${project.projectID}/tasks`}
              student={project?.student ?? undefined}
            />
            {menuEnabled && (
              <ProjectListEntry.MenuButton
                onEditButtonClick={() => handleEditProjectClick(project)}
                onArchiveButtonClick={() => handleArchiveProjectClick(project)}
              />
            )}
          </ProjectListEntry>
        ))
      ) : (
        <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
          You are not a member of any projects yet.
        </Typography>
      )}
    </List>
  );
};
