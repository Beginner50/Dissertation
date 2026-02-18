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
import MenuButton from "../base.components/menu-button.component";

export default function TaskListEntry({
  task,
  projectID,
  menuEnabled,
  onEdit,
  onDelete,
}: {
  task: Task;
  projectID: string | number | undefined;
  menuEnabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
      <TaskListEntry.Icon status={task.status} />

      <TaskListEntry.Link
        title={task.title}
        url={`/projects/${projectID}/tasks/${task.taskID}`}
        dueDate={task.dueDate}
        status={task.status}
      />

      {menuEnabled && (
        <TaskListEntry.MenuButton
          onEditButtonClick={onEdit}
          onDeleteButtonClick={onDelete}
        />
      )}
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
  return (
    <MenuButton>
      <MenuItem onClick={onEditButtonClick}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <Typography variant="body2">Edit</Typography>
      </MenuItem>

      <Divider />

      <MenuItem onClick={onDeleteButtonClick}>
        <ListItemIcon>
          <Delete fontSize="small" color="error" />
        </ListItemIcon>
        <Typography variant="body2" color="error">
          Delete
        </Typography>
      </MenuItem>
    </MenuButton>
  );
};
