import { Box } from "@mui/material";
import Header from "../../components/header.components/header.component";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../providers/auth.provider";
import Breadcrumbs from "../../components/header.components/breadcrumbs.component";

/*
  This is a layout route for the part of the website visible to ordinary users
  (supervisors and students). It has 2 functions:

  1) It redirects the user to the sign-in page if they are not authenticated

  2) It renders the actual webpage's contents (any of the routes within normal.routes)
     inside the <Outlet /> element.
*/
export default function NormalRoutesLayout() {
  const {
    authState: { isAuthenticated },
  } = useAuth();
  if (!isAuthenticated) return <Navigate to={"/sign-in"} />;

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

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}>
        <Breadcrumbs />

        <Outlet />
      </Box>
    </>
  );
}
