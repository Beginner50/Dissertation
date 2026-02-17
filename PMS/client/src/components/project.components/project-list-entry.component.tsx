import { Edit, Archive, MoreVert, SupervisorAccount, School } from "@mui/icons-material";
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Chip,
  Box,
  Stack,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { theme } from "../../lib/theme";
import type { Project, User } from "../../lib/types";

export default function ProjectListEntry({
  project,
  menuEnabled,
  onEdit,
  onArchive,
}: {
  project: Project;
  menuEnabled: boolean;
  onEdit: () => void;
  onArchive: () => void;
}) {
  return (
    <ListItem
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        p: "4px 16px",
        mb: 1.5,
        bgcolor: "hsl(0,0%,99.5%)",
        borderRadius: 2,
        border: "1px solid",
        borderColor: theme.borderNormal || "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: theme.shadowSoft || 2,
        },
      }}>
      {/* Internal Composition */}
      <ProjectListEntry.Link
        title={project.title}
        url={`/projects/${project.projectID}/tasks`}
        student={project?.student}
        supervisor={project?.supervisor}
      />

      {menuEnabled && (
        <ProjectListEntry.MenuButton
          onEditButtonClick={onEdit}
          onArchiveButtonClick={onArchive}
        />
      )}
    </ListItem>
  );
}

ProjectListEntry.Link = ({
  title,
  url,
  student,
  supervisor,
}: {
  title: string;
  url: string;
  student?: User;
  supervisor?: User;
}) => {
  return (
    <ListItemText
      sx={{ flexGrow: 1 }}
      primary={
        <Link to={url} style={{ textDecoration: "none" }}>
          <Typography
            variant="subtitle1"
            component="span"
            sx={{
              fontWeight: 600,
              color: theme.link || "primary.main",
              transition: "color 0.2s",
              "&:hover": { textDecoration: "underline" },
            }}>
            {title}
          </Typography>
        </Link>
      }
      secondary={
        <Typography component="div">
          <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
            {/* Student */}
            {student && (
              <Chip
                icon={<School sx={{ fontSize: "1rem !important" }} />}
                label={
                  <Box component="span">
                    <Typography variant="caption" sx={{ opacity: 0.7, mr: 0.5 }}>
                      Student:
                    </Typography>
                    {student.name}
                  </Box>
                }
                size="small"
                variant="outlined"
                sx={{ borderRadius: "6px", px: 0.5 }}
              />
            )}

            {supervisor && (
              <Chip
                icon={
                  <SupervisorAccount
                    sx={{ fontSize: "1rem !important", color: "primary.main" }}
                  />
                }
                label={
                  <Box component="span">
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, mr: 0.5, color: "primary.dark" }}>
                      Supervisor:
                    </Typography>
                    <span style={{ fontWeight: 500 }}>{supervisor.name}</span>
                  </Box>
                }
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: "6px",
                  px: 0.5,
                  borderColor: "primary.main",
                  bgcolor: "rgba(25, 118, 210, 0.05)",
                  color: "primary.dark",
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
            )}
          </Stack>
        </Typography>
      }
    />
  );
};

ProjectListEntry.MenuButton = ({
  onEditButtonClick,
  onArchiveButtonClick,
}: {
  onEditButtonClick: () => void;
  onArchiveButtonClick: () => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen} size="small">
        <MoreVert />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}>
        <MenuItem
          onClick={() => {
            onEditButtonClick();
            handleClose();
          }}
          sx={{ minWidth: 120 }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Edit</Typography>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            onArchiveButtonClick();
            handleClose();
          }}>
          <ListItemIcon>
            <Archive fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2" color="error">
            Archive
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
