import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, NavLink, useNavigate } from "react-router";
import { theme } from "../../lib/theme";
import { useAuth } from "../../providers/auth.provider";
import type { User } from "../../lib/types";
import React from "react";

export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: `1px solid ${theme.borderSoft}`,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>{children}</Toolbar>
    </AppBar>
  );
}

Header.Brand = ({ title }: { title: string }) => {
  return (
    <Link to="/" style={{ textDecoration: "none", color: "black" }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Link>
  );
};

Header.Navigation = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box component="nav" sx={{ display: "flex", gap: 4, ml: 5 }}>
      {children}
    </Box>
  );
};

Header.NavItem = ({ to, label }: { to: string; label: string }) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: "none",
        fontSize: "1rem",
        fontWeight: 500,
        padding: "18px 0",
        borderBottom: isActive
          ? `3px solid ${theme.link}`
          : "3px solid transparent",
        color: isActive ? theme.linkFocused : theme.textMuted,
        transition: "all 0.2s ease",
      })}
    >
      {label}
    </NavLink>
  );
};

Header.Actions = ({ children }: { children: React.ReactNode }) => {
  return <Box sx={{ display: "flex", alignItems: "center" }}>{children}</Box>;
};

Header.SignOutButton = () => {
  const navigate = useNavigate();
  const { authState, signOut } = useAuth();
  const user = authState.user as User;

  const handleSignOut = async () => {
    if (user?.userID) {
      await signOut(user.userID);
      navigate("/sign-in");
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleSignOut}
      sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
    >
      Sign Out
    </Button>
  );
};
