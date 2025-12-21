import type { Theme } from "@emotion/react";
import { Box, Button, Divider, Typography, type SxProps } from "@mui/material";
import { AddCircleOutline, GroupAdd } from "@mui/icons-material";
import { type ReactNode } from "react";
import type { Project } from "../../lib/types";
import { theme } from "../../lib/theme";
import ProjectListEntry from "./project-list-entry.component";

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

ProjectList.Actions = ({
  onCreateProjectButtonClick,
  onJoinProjectButtonClick,
}: {
  onCreateProjectButtonClick: () => void;
  onJoinProjectButtonClick: () => void;
}) => {
  return (
    <>
      <Button
        color="primary"
        sx={{
          rowGap: "10px",
        }}
        variant="contained"
        disableElevation
        onClick={onCreateProjectButtonClick}
      >
        <AddCircleOutline sx={{ fontSize: "1rem" }} />
        Create Project
      </Button>
      <Button
        color="secondary"
        disableElevation
        variant="outlined"
        onClick={onJoinProjectButtonClick}
      >
        <GroupAdd sx={{ fontSize: "1rem" }} />
        Join Project
      </Button>
    </>
  );
};

ProjectList.Content = ({
  projects,
  onEditButtonClick,
  onArchiveButtonClick,
}: {
  projects: Project[];
  onEditButtonClick: () => void;
  onArchiveButtonClick: () => void;
}) => {
  return (
    <Box
      sx={{
        overflowY: "visible",
      }}
    >
      {projects.length > 0 ? (
        projects.map((project) => (
          <ProjectListEntry key={project.projectID}>
            <ProjectListEntry.Link
              title={project.title}
              url={`/projects/${project.projectID}/tasks`}
              student={project?.student ?? undefined}
            />
            <ProjectListEntry.MenuButton
              onEditButtonClick={onEditButtonClick}
              onArchiveButtonClick={onArchiveButtonClick}
            />
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
