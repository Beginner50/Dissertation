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
  const page = Math.floor(offset / limit);

  const handleMuiPageChange = (_: unknown, newPage: number) => {
    onPageChange(newPage * limit);
  };

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
          <TableHead>
            <TableRow>
              {["UserID", "Name", "Email", "Role", "Status"].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    backgroundColor: "#f8f8f8",
                    borderBottom: `2px solid ${theme.borderSoft}`,
                    padding: "10px 16px",
                    color: theme.textStrong,
                  }}>
                  {head}
                </TableCell>
              ))}
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  backgroundColor: "#f8f8f8",
                  borderBottom: `2px solid ${theme.borderSoft}`,
                  padding: "10px 16px",
                  color: theme.textStrong,
                  textAlign: "right",
                }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={24} sx={{ color: theme.link }} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" sx={{ color: theme.textStrong }}>
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isDeleted = !!user.isDeleted;
                return (
                  <TableRow
                    key={user.userID}
                    hover={!isDeleted}
                    sx={{
                      opacity: isDeleted ? 0.5 : 1,
                      bgcolor: isDeleted ? "rgba(0,0,0,0.03)" : "inherit",
                    }}>
                    <TableCell
                      sx={{
                        fontFamily: "monospace",
                        color: isDeleted ? "text.disabled" : theme.link,
                      }}>
                      {user.userID}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "0.95rem",
                        padding: "10px 16px",
                        fontWeight: 500,
                        color: theme.textStrong,
                        textDecoration: isDeleted ? "line-through" : "none",
                      }}>
                      {user.name}
                    </TableCell>
                    <TableCell
                      sx={{ textDecoration: isDeleted ? "line-through" : "none" }}>
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          borderRadius: "6px",
                          backgroundColor: user.role === "admin" ? "#f0f7ff" : "#f5f5f5",
                          color: user.role === "admin" ? theme.link : theme.textStrong,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isDeleted ? "Deleted" : "Active"}
                        size="small"
                        variant={isDeleted ? "outlined" : "filled"}
                        color={isDeleted ? "error" : "success"}
                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      {!isDeleted && (
                        <UserTable.MenuButton
                          onEdit={() => handleEditUserClick(user)}
                          onDelete={() => handleDeleteUserClick(user)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[]}
        onPageChange={handleMuiPageChange}
        sx={{
          borderTop: `1px solid ${theme.borderSoft}`,
          backgroundColor: "#f8f8f8",
        }}
      />
    </Paper>
  );
}

UserTable.MenuButton = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ color: theme.textStrong }}>
        <MoreVertIcon sx={{ fontSize: "1.4rem" }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              border: `1px solid ${theme.borderSoft}`,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
            },
          },
        }}>
        <MenuItem
          onClick={() => {
            onEdit();
            handleClose();
          }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Edit User</Typography>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={() => {
            onDelete();
            handleClose();
          }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
            Delete User
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
