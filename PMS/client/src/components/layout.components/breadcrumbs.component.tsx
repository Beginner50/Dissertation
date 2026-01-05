import { Breadcrumbs as MuiBreadcrumbs, Typography } from "@mui/material";
import { Link, useLocation, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { theme } from "../../lib/theme";
import type { Project, Task, User } from "../../lib/types";
import { useAuth } from "../../providers/auth.provider";

export default function Breadcrumbs() {
  const { authState, authorizedAPI } = useAuth();
  const user = authState.user as User;

  const { pathname } = useLocation();

  const { projectID, taskID } = useParams();

  const { data: project } = useQuery({
    queryKey: ["projects", projectID],
    queryFn: async (): Promise<Project> =>
      await authorizedAPI
        .get(`api/users/${user.userID}/projects/${projectID}`)
        .json(),
    enabled: projectID != undefined,
  });

  const { data: task } = useQuery({
    queryKey: ["tasks", taskID],
    queryFn: async (): Promise<Task> =>
      await authorizedAPI
        .get(`api/users/${user.userID}/projects/${projectID}/tasks/${taskID}`)
        .json(),
    enabled: taskID != undefined,
  });

  const breadcrumbs = [];
  if (pathname.includes("/projects")) {
    breadcrumbs.push({ url: "/projects", text: "Projects" });
  }

  if (projectID && project) {
    breadcrumbs.push({
      url: `/projects/${projectID}/tasks`,
      text: project.title,
    });

    if (taskID && task) {
      breadcrumbs.push({
        url: `/projects/${projectID}/tasks/${taskID}`,
        text: task.title,
      });
    }
  }

  return (
    <MuiBreadcrumbs sx={{ marginLeft: "5vw", marginY: "1.5vh" }}>
      {breadcrumbs.map((link, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <Link to={link.url} key={link.url} style={{ textDecoration: "none" }}>
            <Typography
              sx={{
                fontWeight: "600",
                color: isLast ? theme.textStrong : theme.textMuted,
                "&:hover": { textDecoration: isLast ? "none" : "underline" },
              }}
            >
              {link.text}
            </Typography>
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
