import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  Typography,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Delete, Edit } from "@mui/icons-material";
import { useState } from "react";
import { theme } from "../../lib/theme";
import type { User, UserFormData } from "../../lib/types";
import MenuButton from "../base.components/menu-button.component";

export default function UserTable({
  users,
  isLoading,
  totalCount,
  limit,
  offset,
  onPageChange,
  handleEditUserClick,
  handleDeleteUserClick,
}: {
  users: User[];
  isLoading: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
  handleEditUserClick: (user: User) => void;
  handleDeleteUserClick: (user: User) => void;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        border: `1px solid ${theme.borderSoft}`,
        borderRadius: "8px",
        overflow: "hidden",
      }}>
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <UserTable.Header />
          <TableBody>
            {isLoading ? (
              <UserTable.LoadingState />
            ) : users.length === 0 ? (
              <UserTable.EmptyState />
            ) : (
              users.map((user) => (
                <UserTable.Row
                  key={user.userID}
                  user={user}
                  onEdit={() => handleEditUserClick(user)}
                  onDelete={() => handleDeleteUserClick(user)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={totalCount}
        page={Math.floor(offset / limit)}
        rowsPerPage={limit}
        rowsPerPageOptions={[]}
        onPageChange={(_, page) => onPageChange(page * limit)}
        sx={{ borderTop: `1px solid ${theme.borderSoft}`, backgroundColor: "#f8f8f8" }}
      />
    </Paper>
  );
}

UserTable.Header = () => (
  <TableHead>
    <TableRow>
      {["UserID", "Name", "Email", "Role", "Status", "Actions"].map((head) => (
        <TableCell
          key={head}
          align={head === "Actions" ? "right" : "left"}
          sx={{
            fontWeight: 600,
            backgroundColor: "#f8f8f8",
            borderBottom: `2px solid ${theme.borderSoft}`,
            padding: "10px 16px",
            color: theme.textStrong,
          }}>
          {head}
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);

UserTable.Row = ({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const isDeleted = !!user.isDeleted;
  return (
    <TableRow
      hover={!isDeleted}
      sx={{
        opacity: isDeleted ? 0.5 : 1,
        bgcolor: isDeleted ? "rgba(0,0,0,0.03)" : "inherit",
      }}>
      <TableCell
        sx={{ fontFamily: "monospace", color: isDeleted ? "text.disabled" : theme.link }}>
        {user.userID}
      </TableCell>
      <TableCell
        sx={{ fontWeight: 500, textDecoration: isDeleted ? "line-through" : "none" }}>
        {user.name}
      </TableCell>
      <TableCell sx={{ textDecoration: isDeleted ? "line-through" : "none" }}>
        {user.email}
      </TableCell>
      <TableCell>
        <Chip
          label={user.role}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor: user.role === "admin" ? "#f0f7ff" : "#f5f5f5",
            color: user.role === "admin" ? theme.link : theme.textStrong,
          }}
        />
      </TableCell>
      <TableCell>
        <Chip
          label={isDeleted ? "Deleted" : "Active"}
          size="small"
          color={isDeleted ? "error" : "success"}
          variant={isDeleted ? "outlined" : "filled"}
        />
      </TableCell>
      <TableCell align="right">
        {!isDeleted && <UserTable.MenuButton onEdit={onEdit} onDelete={onDelete} />}
      </TableCell>
    </TableRow>
  );
};

UserTable.LoadingState = () => (
  <TableRow>
    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
      <CircularProgress size={24} sx={{ color: theme.link }} />
    </TableCell>
  </TableRow>
);

UserTable.EmptyState = () => (
  <TableRow>
    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
      <Typography variant="body2">No users found.</Typography>
    </TableCell>
  </TableRow>
);

UserTable.MenuButton = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <MenuButton>
    <MenuItem onClick={onEdit}>
      <ListItemIcon>
        <Edit fontSize="small" />
      </ListItemIcon>
      <Typography variant="body2">Edit User</Typography>
    </MenuItem>
    <Divider sx={{ my: 1 }} />
    <MenuItem onClick={onDelete}>
      <ListItemIcon>
        <Delete fontSize="small" color="error" />
      </ListItemIcon>
      <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
        Delete User
      </Typography>
    </MenuItem>
  </MenuButton>
);
