import { Breadcrumbs as MuiBreadcrumbs, Typography } from "@mui/material";
import { Link, useLocation, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { theme } from "../../lib/theme";
import { user, origin } from "../../lib/temp";
import type { Project, Task } from "../../lib/types";

const fetchProject = async (userID: number, projectID: string) => {
  return (await ky
    .get(`${origin}/api/users/${userID}/projects/${projectID}`)
    .json()) as Project;
};

const fetchTask = async (
  userID: number,
  projectID?: string,
  taskID?: string
) => {
  return (await ky
    .get(`${origin}/api/users/${userID}/projects/${projectID}/tasks/${taskID}`)
    .json()) as Task;
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();

  const { projectID, taskID } = useParams();

  const { data: project } = useQuery({
    queryKey: ["project", projectID],
    queryFn: () => fetchProject(user.userID, projectID!),
    enabled: !!projectID,
  });
  const { data: task } = useQuery({
    queryKey: ["task"],
    queryFn: () => fetchTask(user.userID, projectID, taskID),
    enabled: !!taskID,
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
