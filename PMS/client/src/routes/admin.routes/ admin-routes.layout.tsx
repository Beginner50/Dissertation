import { Box } from "@mui/material";
import Header from "../../components/header.components/header.component";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../providers/auth.provider";

export default function AdminRoutesLayout() {
  const {
    authState: { isAuthenticated },
  } = useAuth();
  if (!isAuthenticated) return <Navigate to={"/sign-in"} />;

  return (
    <>
      <Header>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Header.Brand title="Project Management System" />
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
        <Outlet />
      </Box>
    </>
  );
}
