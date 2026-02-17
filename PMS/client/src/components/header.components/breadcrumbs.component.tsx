import { Breadcrumbs as MuiBreadcrumbs, Typography } from "@mui/material";
import { Link, useLocation } from "react-router";
import { theme } from "../../lib/theme";
import React from "react";

export default function Breadcrumbs({ children }: { children: React.ReactNode }) {
  return (
    <MuiBreadcrumbs sx={{ marginLeft: "5vw", marginY: "1.5vh" }}>
      {children}
    </MuiBreadcrumbs>
  );
}

Breadcrumbs.Link = ({ to, label }: { to: string; label: string }) => {
  const { pathname } = useLocation();
  const isLast = pathname === to;

  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <Typography
        sx={{
          fontWeight: "600",
          color: isLast ? theme.textStrong : theme.textMuted,
          "&:hover": { textDecoration: isLast ? "none" : "underline" },
        }}>
        {label}
      </Typography>
    </Link>
  );
};
