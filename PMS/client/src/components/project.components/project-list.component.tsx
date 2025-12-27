import type { Theme } from "@emotion/react";
import { Box, Button, Divider, Typography, type SxProps } from "@mui/material";
import { AddCircleOutline, Description, GroupAdd } from "@mui/icons-material";
import { type ReactNode } from "react";
import type { Project, ProjectFormData } from "../../lib/types";
import { theme } from "../../lib/theme";
import ProjectListEntry from "./project-list-entry.component";
import { user } from "../../lib/temp";

export function ProjectList({
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
        display: "flex",
        background: "white",
        borderRadius: "8px",
        borderColor: theme.borderSoft,
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

ProjectList.Header = ({
  sx,
  children,
}: {
  sx?: SxProps<Theme> | undefined;
  children?: ReactNode;
}) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          paddingBottom: "0.5rem",
          ...sx,
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
          My Projects
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
      <Divider
        sx={{
          marginBottom: "0.7rem",
        }}
      />
    </>
  );
};

ProjectList.CreateProjectButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      color="primary"
      sx={{
        rowGap: "10px",
      }}
      variant="contained"
      disableElevation
      onClick={onClick}
    >
      <AddCircleOutline sx={{ fontSize: "1rem" }} />
      Create Project
    </Button>
  );
};

ProjectList.JoinProjectButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      color="secondary"
      disableElevation
      variant="outlined"
      onClick={onClick}
    >
      <GroupAdd sx={{ fontSize: "1rem" }} />
      Join Project
    </Button>
  );
};

ProjectList.List = ({
  projects,
  handleEditProjectClick,
  handleArchiveProjectClick,
}: {
  projects: Project[];
  handleEditProjectClick: (project: Project) => void;
  handleArchiveProjectClick: (project: Project) => void;
}) => {
  return (
    <Box
      sx={{
        overflowY: "visible",
      }}
    >
      {projects.length > 0 ? (
        projects
          ?.filter((project) => project.status === "active")
          .map((project) => (
            <ProjectListEntry key={project.projectID}>
              <ProjectListEntry.Link
                title={project.title}
                url={`/projects/${project.projectID}/tasks`}
                student={project?.student ?? undefined}
              />
              {user.role == "supervisor" && (
                <ProjectListEntry.MenuButton
                  onEditButtonClick={() => handleEditProjectClick(project)}
                  onArchiveButtonClick={() =>
                    handleArchiveProjectClick(project)
                  }
                />
              )}
            </ProjectListEntry>
          ))
      ) : (
        <Typography variant="body1" color="text.secondary">
          You are not a member of any projects yet.
        </Typography>
      )}
    </Box>
  );
};
