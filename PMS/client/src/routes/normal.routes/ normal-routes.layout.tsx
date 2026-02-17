import { Box } from "@mui/material";
import Header from "../../components/header.components/header.component";
import { Navigate, Outlet, useLocation, useParams } from "react-router";
import { useAuth } from "../../providers/auth.provider";
import Breadcrumbs from "../../components/header.components/breadcrumbs.component";
import { useQuery } from "@tanstack/react-query";
import type { Project, User } from "../../lib/types";

/*
  This is a layout route for the part of the website visible to ordinary users
  (supervisors and students). It has 2 functions:

  1) It redirects the user to the sign-in page if they are not authenticated

  2) It renders the actual webpage's contents (any of the routes within normal.routes)
     inside the <Outlet /> element.
*/
export default function NormalRoutesLayout() {
  const { authState, authorizedAPI } = useAuth();
  const { projectID, taskID } = useParams();
  const { pathname } = useLocation();
  const user = authState.user as User;

  if (!authState.isAuthenticated) return <Navigate to={"/sign-in"} />;

  const { data: project } = useQuery({
    queryKey: ["projects", projectID],
    queryFn: async (): Promise<Project> =>
      await authorizedAPI.get(`api/users/${user.userID}/projects/${projectID}`).json(),
    enabled: !!projectID && !!user,
  });

  const currentTaskTitle = project?.tasks?.find(
    (t) => t.taskID.toString() === taskID,
  )?.title;
  const showBreadcrumbs = !pathname.startsWith("/scheduler");

  return (
    <>
      <Header>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Header.Brand title="Project Management System" />
          <Header.Navigation>
            <Header.NavItem to="/projects" label="Projects" />
            <Header.NavItem to="/scheduler" label="Scheduler" />
          </Header.Navigation>
        </Box>
        <Header.Actions>
          <Header.SignOutButton />
        </Header.Actions>
      </Header>

      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {showBreadcrumbs && (
          <Breadcrumbs>
            <Breadcrumbs.Link to="/projects" label="Projects" />
            {project && (
              <Breadcrumbs.Link
                to={`/projects/${projectID}/tasks`}
                label={project.title}
              />
            )}
            {project && taskID && (
              <Breadcrumbs.Link
                to={`/projects/${projectID}/tasks/${taskID}`}
                label={currentTaskTitle || "Task"}
              />
            )}
          </Breadcrumbs>
        )}

        <Outlet />
      </Box>
    </>
  );
}
