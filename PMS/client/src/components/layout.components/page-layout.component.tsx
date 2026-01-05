import { Navigate } from "react-router";
import { useAuth } from "../../providers/auth.provider";
import Breadcrumbs from "./breadcrumbs.component";
import Header from "./header.component";
import { Box } from "@mui/material";
import type { ReactNode } from "react";

export default function PageLayout() {
  return <></>;
}

PageLayout.Normal = ({ children }: { children?: ReactNode }) => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  if (!isAuthenticated) return <Navigate to={"sign-in"} />;

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
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "row",
            marginLeft: "4.5vw",
            marginRight: "3vw",
            marginBottom: "2vh",
            columnGap: "2vw",
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

PageLayout.Admin = ({ children }: { children?: ReactNode }) => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  if (!isAuthenticated) return <Navigate to={"sign-in"} />;

  return (
    <div>
      <Header>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Header.Brand title="Project Management System" />
        </Box>
      </Header>
      {children}
    </div>
  );
};

PageLayout.SignIn = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <Header>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Header.Brand title="Project Management System" />
        </Box>
      </Header>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "89.5vh",
        }}
      >
        {children}
      </Box>
    </>
  );
};
