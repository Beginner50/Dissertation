import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { theme } from "../../lib/theme";
import {
  CompletedVariant1,
  MissingVariant1,
  PendingVariant1,
} from "../base.components/status-tags.component";
import { Link } from "react-router";
import { Delete, Edit, MoreVert } from "@mui/icons-material";
import { useRef, useState, type ReactNode } from "react";

export default function TaskListEntry({
  status,
  children,
}: {
  status: string;
  children?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "10px 12px",
        marginBottom: "8px",
        background: "hsl(0,0%,99.5%)",
        borderRadius: "8px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.borderNormal,
        boxShadow: theme.shadowMuted,
        transition:
          "box-shadow 0.2s, border-color 0.2s, opacity 0.3s, transform 0.1s",
        gap: "14px",

        "&:hover": {
          borderColor: theme.borderNormal,
          boxShadow: theme.shadowSoft,
        },
      }}
    >
      {status === "completed" ? (
        <CompletedVariant1 />
      ) : status === "missing" ? (
        <MissingVariant1 />
      ) : (
        <PendingVariant1 />
      )}
      {children}
    </Box>
  );
}

TaskListEntry.Link = ({
  title,
  url,
  dueDate,
}: {
  title: string;
  url: string;
  dueDate: string;
}) => {
  const deadline = new Date(dueDate);
  const isDeadlinePast =
    !Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now();

  return (
    <Box
      sx={{
        flexGrow: 1,
        marginRight: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link to={url} style={{ textDecoration: "none" }}>
        <Typography
          component="span"
          sx={{
            textDecoration: "none",
            color: theme.link,
            fontWeight: 600,
            fontSize: "1rem",
            transition: "color 0.2s",
            "&:hover": {
              color: theme.linkFocused,
              textDecoration: "underline",
            },
          }}
        >
          {title}
        </Typography>
      </Link>

      <Typography
        component="span"
        sx={{
          fontSize: "0.85rem",
          color: theme.textNormal,
          textDecoration: isDeadlinePast ? "line-through" : "none",
        }}
      >
        Deadline:
        {isDeadlinePast ? (
          deadline.toLocaleDateString("en-GB")
        ) : (
          <strong style={{ fontWeight: 600 }}>
            {deadline.toLocaleDateString("en-GB")}
          </strong>
        )}
      </Typography>
    </Box>
  );
};

TaskListEntry.MenuButton = ({
  onEditButtonClick,
  onDeleteButtonClick,
}: {
  onEditButtonClick: () => void;
  onDeleteButtonClick: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <IconButton ref={buttonRef} onClick={() => setMenuOpen((prev) => !prev)}>
        <MoreVert fontSize="inherit" />
      </IconButton>
      <TaskListEntry.Menu
        anchorElement={buttonRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEditButtonClick={() => {
          onEditButtonClick();
          setMenuOpen(false);
        }}
        onDeleteButtonClick={() => {
          onDeleteButtonClick();
          setMenuOpen(false);
        }}
      />
    </>
  );
};

TaskListEntry.Menu = ({
  anchorElement,
  open,
  onClose,
  onEditButtonClick,
  onDeleteButtonClick,
}: {
  anchorElement: HTMLElement | null;
  open: boolean;
  onClose?: () => void;
  onEditButtonClick: () => void;
  onDeleteButtonClick: () => void;
}) => {
  return (
    <Menu
      anchorEl={anchorElement}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        horizontal: "right",
        vertical: "top",
      }}
    >
      <MenuList sx={{ padding: 0, borderRadius: "0.4rem" }}>
        <MenuItem onClick={onEditButtonClick}>
          <ListItemIcon>
            <Edit sx={{ fontSize: "1.2rem" }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onDeleteButtonClick}>
          <ListItemIcon>
            <Delete sx={{ fontSize: "1.2rem" }} color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "hsl(0, 96.80%, 36.90%)" }}>
            Delete
          </ListItemText>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
