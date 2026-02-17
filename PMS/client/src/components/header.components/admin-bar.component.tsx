import { Stack, ToggleButton, ToggleButtonGroup, Button } from "@mui/material";
import { useNavigate, useLocation, NavLink } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAuth } from "../../providers/auth.provider";
import React from "react";

export default function AdminBar({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 3 }}>
      {children}
    </Stack>
  );
}

AdminBar.Navigation = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname.includes("/projects") ? "projects" : "users";

  return (
    <ToggleButtonGroup
      value={currentView}
      exclusive
      onChange={(_, next) => next && navigate(`/admin/${next}`)}
      size="medium"
      sx={{ bgcolor: "white" }}>
      {children}
    </ToggleButtonGroup>
  );
};

AdminBar.NavItem = ({ to, label }: { to: string; label: string }) => (
  <ToggleButton
    value={to}
    component={NavLink}
    to={to}
    sx={{
      textTransform: "none",
      px: 4,
      fontWeight: 600,
      "&.active": {
        backgroundColor: "rgba(0, 0, 0, 0.08)",
        color: "primary.main",
      },
    }}>
    {label}
  </ToggleButton>
);

AdminBar.Actions = ({ children }: { children: React.ReactNode }) => (
  <Stack direction="row" spacing={2}>
    {children}
  </Stack>
);

AdminBar.IngestButton = () => {
  const { authorizedAPI } = useAuth();
  const queryClient = useQueryClient();

  const ingestMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return await authorizedAPI.post("api/admin/ingest", { body: formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleIngestClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv, .xlsx, .xls";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) ingestMutation.mutate(file);
    };
    input.click();
  };

  return (
    <Button
      variant="contained"
      disableElevation
      startIcon={<UploadFileIcon />}
      onClick={handleIngestClick}
      disabled={ingestMutation.isPending}
      sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 600 }}>
      {ingestMutation.isPending ? "Processing..." : "Ingest List"}
    </Button>
  );
};
