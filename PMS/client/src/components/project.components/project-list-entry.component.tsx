import {
  AddCircleOutline,
  Archive,
  Edit,
  GroupAdd,
  MoreVert,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { useRef, useState, type ReactNode, type RefObject } from "react";
import { Link } from "react-router";
import { theme } from "../../lib/theme";
import type { User } from "../../lib/types";

export default function ProjectListEntry({
  children,
}: {
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

        ":hover": {
          borderColor: theme.borderNormal,
          boxShadow: theme.shadowSoft,
        },
      }}
    >
      {children}
    </Box>
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
}) => {
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
          color: theme.textMuted,
        }}
      >
        Student: <strong>{student?.name ?? "N/A"}</strong>
      </Typography>
    </Box>
  );
};

ProjectListEntry.MenuButton = ({
  onEditButtonClick,
  onArchiveButtonClick,
}: {
  onEditButtonClick: () => void;
  onArchiveButtonClick: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <IconButton ref={buttonRef} onClick={() => setMenuOpen((prev) => !prev)}>
        <MoreVert fontSize="inherit" />
      </IconButton>
      <ProjectListEntry.Menu
        open={menuOpen}
        anchorElement={buttonRef.current}
        onClose={() => setMenuOpen(false)}
        onEditButtonClick={onEditButtonClick}
        onArchiveButtonClick={onArchiveButtonClick}
      />
    </>
  );
};

ProjectListEntry.Menu = ({
  anchorElement,
  open,
  onClose,
  onEditButtonClick,
  onArchiveButtonClick,
}: {
  anchorElement: HTMLElement | null;
  open: boolean;
  onClose?: () => void;
  onEditButtonClick: () => void;
  onArchiveButtonClick: () => void;
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
        <MenuItem>
          <ListItemIcon onClick={onArchiveButtonClick}>
            <Archive sx={{ fontSize: "1.2rem" }} color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "hsl(0, 96.80%, 36.90%)" }}>
            Archive
          </ListItemText>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
