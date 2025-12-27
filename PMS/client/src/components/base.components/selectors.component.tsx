import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from "@mui/material";
import { type ReactNode } from "react";
import type { Project, User } from "../../lib/types";

export function Selector({ children }: { children?: ReactNode }) {
  return (
    <Box>
      <List
        sx={{
          maxHeight: 300,
          overflow: "auto",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        {children}
      </List>
    </Box>
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
}) => {
  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => handleSearchChange(e.target.value)}
      sx={{ mb: 2 }}
      size="small"
    />
  );
};

Selector.ProjectList = ({
  filteredProjects,
  selectedProject,
  handleSelectProject,
}: {
  filteredProjects: Project[] | undefined;
  selectedProject: Project | undefined;
  handleSelectProject: (project: Project) => void;
}) => {
  return (
    <>
      {filteredProjects?.map((project) => (
        <Selector.ProjectListEntry
          project={project}
          isSelected={project.projectID == selectedProject?.projectID}
          handleSelectProject={() => handleSelectProject(project)}
        />
      )) ?? <Selector.NotFound placeholder="No projects found" />}
    </>
  );
};

Selector.StudentList = ({
  filteredStudents,
  selectedStudent,
  handleSelectStudent,
}: {
  filteredStudents: User[];
  selectedStudent: User;
  handleSelectStudent: (student: User) => void;
}) => {
  return (
    <>
      {filteredStudents?.map((student) => (
        <Selector.StudentListEntry
          student={student}
          isSelected={student.userID == selectedStudent?.userID}
          handleSelectStudent={() => handleSelectStudent(student)}
        />
      )) ?? <Selector.NotFound placeholder="No students found" />}
    </>
  );
};

Selector.ProjectListEntry = ({
  project,
  handleSelectProject,
  isSelected,
}: {
  handleSelectProject: () => void;
  project: Project;
  isSelected: boolean;
}) => {
  return (
    <ListItem key={project.projectID} disablePadding divider>
      <ListItemButton selected={isSelected} onClick={handleSelectProject}>
        <ListItemText
          primary={project.title}
          secondary={`Student: ${project.student?.name} (${project.student?.email})`}
        />
      </ListItemButton>
    </ListItem>
  );
};

Selector.StudentListEntry = ({
  student,
  isSelected,
  handleSelectStudent,
}: {
  student: User;
  isSelected: boolean;
  handleSelectStudent: () => void;
}) => {
  return (
    <ListItem key={student.userID} disablePadding divider>
      <ListItemButton selected={isSelected} onClick={handleSelectStudent}>
        <ListItemText
          primary={student.userID}
          secondary={`Student: ${student?.name} (${student?.email})`}
        />
      </ListItemButton>
    </ListItem>
  );
};

Selector.NotFound = ({ placeholder }: { placeholder: string }) => {
  return (
    <ListItem>
      <ListItemText
        primary={placeholder}
        sx={{ textAlign: "center", color: "text.secondary" }}
      />
    </ListItem>
  );
};
