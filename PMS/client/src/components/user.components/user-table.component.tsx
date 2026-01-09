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
  ListItem,
  ListItemIcon,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { theme } from "../../lib/theme";
import type { User, UserFormData } from "../../lib/types";
import { Delete } from "@mui/icons-material";
import { useState } from "react";

export default function UserTable({
  users,
  isLoading,
  totalCount,
  page,
  onPageChange,
  handleDeleteUserClick,
}: {
  users: User[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  onPageChange: (event: unknown, newPage: number) => void;
  handleDeleteUserClick: (userFormData: UserFormData) => void;
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
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  backgroundColor: "#f8f8f8",
                  borderBottom: `2px solid ${theme.borderSoft}`,
                  padding: "10px 16px",
                  color: theme.textStrong,
                }}>
                UserID
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  backgroundColor: "#f8f8f8",
                  borderBottom: `2px solid ${theme.borderSoft}`,
                  padding: "10px 16px",
                  color: theme.textStrong,
                }}>
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  backgroundColor: "#f8f8f8",
                  borderBottom: `2px solid ${theme.borderSoft}`,
                  padding: "10px 16px",
                  color: theme.textStrong,
                }}>
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  backgroundColor: "#f8f8f8",
                  borderBottom: `2px solid ${theme.borderSoft}`,
                  padding: "10px 16px",
                  color: theme.textStrong,
                }}>
                Role
              </TableCell>
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
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={24} sx={{ color: theme.link }} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" sx={{ color: theme.textStrong }}>
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.userID} hover>
                  <TableCell
                    sx={{
                      fontSize: "0.95rem",
                      padding: "10px 16px",
                      borderBottom: `1px solid ${theme.borderSoft}`,
                      color: theme.textStrong,
                    }}>
                    {user.userID}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.95rem",
                      padding: "10px 16px",
                      borderBottom: `1px solid ${theme.borderSoft}`,
                      color: theme.textStrong,
                    }}>
                    {user.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.95rem",
                      padding: "10px 16px",
                      borderBottom: `1px solid ${theme.borderSoft}`,
                    }}>
                    {user.email}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.95rem",
                      padding: "10px 16px",
                      borderBottom: `1px solid ${theme.borderSoft}`,
                    }}>
                    <Chip
                      label={user.role}
                      size="small"
                      variant="outlined"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 600,
                        color: theme.textStrong,
                        borderRadius: "4px",
                        minWidth: "8vw",
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.95rem",
                      padding: "10px 16px",
                      borderBottom: `1px solid ${theme.borderSoft}`,
                      textAlign: "right",
                    }}>
                    <UserTable.MenuButton
                      onDeleteButtonClick={() =>
                        handleDeleteUserClick({
                          userID: user.userID,
                          name: user.name,
                          email: user.email,
                          role: user.role,
                        })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={10}
        rowsPerPageOptions={[]}
        onPageChange={onPageChange}
        sx={{
          borderTop: `1px solid ${theme.borderSoft}`,
          backgroundColor: "#f8f8f8",
        }}
      />
    </Paper>
  );
}

UserTable.MenuButton = ({ onDeleteButtonClick }: { onDeleteButtonClick: () => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        sx={{ padding: 0, color: theme.textStrong }}>
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
            onDeleteButtonClick();
            handleClose();
          }}>
          <ListItemIcon>
            <Delete sx={{ fontSize: "1.2rem", color: theme.status.missing }} />
          </ListItemIcon>
          <Typography
            variant="body2"
            sx={{ color: theme.status.missing, fontWeight: 500 }}>
            Delete User
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
