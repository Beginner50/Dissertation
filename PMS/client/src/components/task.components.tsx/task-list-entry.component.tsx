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
import { Edit, Delete, MoreVert } from "@mui/icons-material";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { theme } from "../../lib/theme";
import {
  CompletedVariant1,
  MissingVariant1,
  PendingVariant1,
} from "../base.components/status-tags.component";
import type { Task } from "../../lib/types";

export default function TaskListEntry({ children }: { children?: ReactNode }) {
  return (
    <ListItem
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        p: "12px 16px",
        mb: 1.5,
        bgcolor: "hsl(0,0%,99.5%)",
        borderRadius: 2,
        border: "1px solid",
        borderColor: theme.borderNormal || "divider",
        boxShadow: theme.shadowMuted,
        gap: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: theme.shadowSoft,
        },
      }}>
      {children}
    </ListItem>
  );
}

TaskListEntry.Icon = ({ status }: { status: Task["status"] }) => {
  return (
    <ListItemIcon>
      {status == "completed" ? (
        <CompletedVariant1 />
      ) : status == "missing" ? (
        <MissingVariant1 />
      ) : (
        <PendingVariant1 />
      )}
    </ListItemIcon>
  );
};

TaskListEntry.Link = ({
  title,
  url,
  status,
  dueDate,
}: {
  title: string;
  url: string;
  status: Task["status"];
  dueDate: Date;
}) => {
  return (
    <ListItemText
      sx={{ m: 0 }}
      primary={
        <Link to={url} style={{ textDecoration: "none" }}>
          <Typography
            variant="body1"
            component="span"
            sx={{
              fontWeight: 600,
              color: theme.link || "primary.main",
              "&:hover": { textDecoration: "underline" },
            }}>
            {title}
          </Typography>
        </Link>
      }
      secondary={
        <Typography
          variant="body2"
          component="span"
          sx={{
            color: "text.secondary",
            textDecoration: status == "missing" ? "line-through" : "none",
            display: "block",
            mt: 0.5,
          }}>
          Due Date:{" "}
          <strong style={{ fontWeight: status == "missing" ? 400 : 600 }}>
            {dueDate.toLocaleString("en-US")}
          </strong>
        </Typography>
      }
    />
  );
};

TaskListEntry.MenuButton = ({
  onEditButtonClick,
  onDeleteButtonClick,
}: {
  onEditButtonClick: () => void;
  onDeleteButtonClick: () => void;
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
            onDeleteButtonClick();
            handleClose();
          }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2" color="error">
            Delete
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
