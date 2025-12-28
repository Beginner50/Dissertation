import { Edit, Archive, MoreVert } from "@mui/icons-material";
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { theme } from "../../lib/theme";
import type { User } from "../../lib/types";

export default function ProjectListEntry({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <ListItem
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        p: "8px 16px",
        mb: 1.5,
        bgcolor: "hsl(0,0%,99.5%)",
        borderRadius: 2,
        border: "1px solid",
        borderColor: theme.borderNormal || "divider",
        boxShadow: theme.shadowMuted,

        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: theme.shadowSoft || 2,
        },
      }}
    >
      {children}
    </ListItem>
  );
}

ProjectListEntry.Link = ({
  title,
  url,
  student,
}: {
  title: string;
  url: string;
  student?: User;
}) => (
  <ListItemText
    sx={{ flexGrow: 1 }}
    primary={
      <Link to={url} style={{ textDecoration: "none" }}>
        <Typography
          variant="body1"
          component="span"
          sx={{
            fontWeight: 600,
            color: theme.link || "primary.main",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {title}
        </Typography>
      </Link>
    }
    secondary={
      <Typography
        variant="body2"
        component="span"
        sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
      >
        Student:{" "}
        <strong style={{ color: "text.primary" }}>
          {student?.name ?? "N/A"}
        </strong>
      </Typography>
    }
  />
);

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
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            onEditButtonClick();
            handleClose();
          }}
          sx={{ minWidth: 120 }}
        >
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
          }}
        >
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
