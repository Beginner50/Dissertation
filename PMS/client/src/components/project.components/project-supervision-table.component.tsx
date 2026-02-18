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
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Edit, Archive, RestorePage, Info } from "@mui/icons-material";
import { useState } from "react";
import { theme } from "../../lib/theme";
import type { Project, User } from "../../lib/types";
import MenuButton from "../base.components/menu-button.component";

export default function ProjectSupervisionTable({
  projects,
  isLoading,
  totalCount,
  limit,
  offset,
  onPageChange,
  handleEditClick,
  handleArchiveClick,
  handleRestoreClick,
}: {
  projects: Project[];
  isLoading: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
  handleEditClick: (project: Project) => void;
  handleArchiveClick: (project: Project) => void;
  handleRestoreClick: (project: Project) => void;
}) {
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
              {["ID", "Title", "Student", "Supervisor", "Status", "Actions"].map(
                (head) => (
                  <TableCell
                    key={head}
                    align={head === "Actions" ? "right" : "left"}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#f8f8f8",
                      color: theme.textStrong,
                      padding: "10px 16px",
                    }}>
                    {head}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2">No projects found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => {
                const hasDeletedUser = !!(
                  project.student?.isDeleted || project.supervisor?.isDeleted
                );

                return (
                  <TableRow
                    key={project.projectID}
                    hover
                    sx={{ opacity: hasDeletedUser ? 0.7 : 1 }}>
                    <TableCell sx={{ fontFamily: "monospace", color: theme.link }}>
                      {project.projectID}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{project.title}</TableCell>

                    <ProjectSupervisionTable.UserCell user={project.student} />
                    <ProjectSupervisionTable.UserCell user={project.supervisor} />

                    <TableCell>
                      <Chip
                        label={project.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          textTransform: "capitalize",
                          bgcolor: project.status === "active" ? "#e8f5e9" : "#f5f5f5",
                          color:
                            project.status === "active" ? "#2e7d32" : theme.textStrong,
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <ProjectSupervisionTable.Actions
                        project={project}
                        hasDeletedUser={hasDeletedUser}
                        onEdit={() => handleEditClick(project)}
                        onArchive={() => handleArchiveClick(project)}
                        onRestore={() => handleRestoreClick(project)}
                      />
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
        page={Math.floor(offset / limit)}
        rowsPerPage={limit}
        rowsPerPageOptions={[]}
        onPageChange={handleMuiPageChange}
      />
    </Paper>
  );
}

ProjectSupervisionTable.UserCell = ({ user }: { user?: User }) => {
  const isDeleted = !!user?.isDeleted;
  return (
    <TableCell
      sx={{ fontSize: "0.85rem", color: isDeleted ? theme.status.missing : "inherit" }}>
      {user?.name || "Unassigned"}
      {isDeleted && " (Deleted)"}
    </TableCell>
  );
};

ProjectSupervisionTable.Actions = ({
  project,
  hasDeletedUser,
  onEdit,
  onArchive,
  onRestore,
}: {
  project: Project;
  hasDeletedUser: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
}) => {
  if (hasDeletedUser) {
    return (
      <Tooltip
        title="This project cannot be edited due to one or more users of the project being deleted"
        arrow
        placement="left">
        <IconButton size="small" sx={{ color: theme.status.missing }}>
          <Info />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <ProjectSupervisionTable.MenuButton
      status={project.status}
      onEdit={onEdit}
      onArchive={onArchive}
      onRestore={onRestore}
    />
  );
};

ProjectSupervisionTable.MenuButton = ({
  status,
  onEdit,
  onArchive,
  onRestore,
}: {
  status: Project["status"];
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
}) => (
  <MenuButton>
    <MenuItem onClick={onEdit}>
      <ListItemIcon>
        <Edit fontSize="small" />
      </ListItemIcon>
      <Typography variant="body2">Edit Project</Typography>
    </MenuItem>
    <Divider sx={{ my: 1 }} />
    {status === "active" ? (
      <MenuItem onClick={onArchive}>
        <ListItemIcon>
          <Archive fontSize="small" color="error" />
        </ListItemIcon>
        <Typography variant="body2" color="error">
          Archive Project
        </Typography>
      </MenuItem>
    ) : (
      <MenuItem onClick={onRestore}>
        <ListItemIcon>
          <RestorePage fontSize="small" color="primary" />
        </ListItemIcon>
        <Typography variant="body2" color="primary">
          Restore Project
        </Typography>
      </MenuItem>
    )}
  </MenuButton>
);
