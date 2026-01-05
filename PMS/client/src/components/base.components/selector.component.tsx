import {
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Paper,
  InputAdornment,
  Typography,
  ListItemIcon,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import { type ReactNode } from "react";
import type { Project, User } from "../../lib/types";

export function Selector({ children }: { children?: ReactNode }) {
  return (
    <Stack spacing={2} sx={{ px: 3, py: 1 }}>
      {children}
    </Stack>
  );
}

Selector.Search = ({
  placeholder,
  searchTerm,
  handleSearchChange,
}: {
  placeholder: string;
  searchTerm: string;
  handleSearchChange: (searchTerm: string) => void;
}) => (
  <FormControl fullWidth>
    <TextField
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => handleSearchChange(e.target.value)}
      size="small"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  </FormControl>
);

Selector.Content = ({ children }: { children: ReactNode }) => (
  <Paper
    variant="outlined"
    sx={{
      maxHeight: "300px",
      overflowY: "auto",
    }}
  >
    <List disablePadding>{children}</List>
  </Paper>
);

Selector.ProjectListEntry = ({
  project,
  handleSelectProject,
  isSelected,
}: {
  handleSelectProject: () => void;
  project: Project;
  isSelected: boolean;
}) => (
  <ListItem disablePadding divider>
    <ListItemButton
      selected={isSelected}
      onClick={handleSelectProject}
      sx={{ py: 1.5 }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <AssignmentIcon color={isSelected ? "primary" : "inherit"} />
      </ListItemIcon>
      <ListItemText
        primary={project.title}
        secondary={`${project.student?.name} (${project.student?.email})`}
      />
    </ListItemButton>
  </ListItem>
);

Selector.StudentListEntry = ({
  student,
  isSelected,
  handleSelectStudent,
}: {
  student: User;
  isSelected: boolean;
  handleSelectStudent: () => void;
}) => (
  <ListItem disablePadding divider>
    <ListItemButton
      selected={isSelected}
      onClick={handleSelectStudent}
      sx={{ py: 1.5 }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <PersonIcon color={isSelected ? "primary" : "inherit"} />
      </ListItemIcon>
      <ListItemText
        primary={`ID: ${student.userID}`}
        secondary={`${student?.name} (${student?.email})`}
      />
    </ListItemButton>
  </ListItem>
);

Selector.NotFound = ({ placeholder }: { placeholder: string }) => (
  <ListItem sx={{ py: 4, justifyContent: "center" }}>
    <Typography color="text.secondary" variant="body2">
      {placeholder}
    </Typography>
  </ListItem>
);
