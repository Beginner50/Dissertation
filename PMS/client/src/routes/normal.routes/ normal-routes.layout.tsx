import { Box } from "@mui/material";
import Header from "../../components/header.components/header.component";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../providers/auth.provider";
import Breadcrumbs from "../../components/header.components/breadcrumbs.component";

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
        }}
      >
        <Breadcrumbs />

        <Outlet />
      </Box>
    </>
  );
}
