import { Box, Container } from "@mui/material";
import Header from "../../components/header.components/header.component";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../providers/auth.provider";
import AdminBar from "../../components/header.components/admin-bar.component";

export default function AdminRoutesLayout() {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  if (!isAuthenticated) return <Navigate to={"/sign-in"} />;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f5f7f9",
      }}>
      <Header>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Header.Brand title="Project Management System" />
        </Box>
        <Header.Actions>
          <Header.SignOutButton />
        </Header.Actions>
      </Header>

      <Container maxWidth="lg" sx={{ py: 2 }}>
        <AdminBar>
          <AdminBar.Navigation>
            <AdminBar.NavItem to="/admin-dashboard/users" label="Users" />
            <AdminBar.NavItem
              to="/admin-dashboard/supervision-list"
              label="Supervision List"
            />
          </AdminBar.Navigation>
        </AdminBar>

        <Box component="main">
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
}
