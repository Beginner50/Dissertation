import {
  Box,
  Typography,
  Button,
  type SxProps,
  type Theme,
  Divider,
} from "@mui/material";
import { theme } from "../../lib/theme";
import type { Project, User } from "../../lib/types";
import type { ReactNode } from "react";

export function ProjectDetails({
  sx,
  children,
}: {
  sx?: SxProps<Theme> | undefined;
  children?: ReactNode;
}) {
  return (
    <Box
      sx={{
        background: `rgba(255, 255, 255, 0.73)`,
        borderRadius: "8px",
        padding: "16px",
        border: `1px solid ${theme.borderSoft || "#e5e7eb"}`,
        boxShadow: theme.shadowMuted || "0 4px 12px rgba(17, 24, 39, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

ProjectDetails.Header = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        flexGrow: 1,
      }}
    >
      <Typography
        variant="h3"
        component="h3"
        sx={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "#0f172a",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>

      <Typography
        component="p"
        sx={{
          margin: 0,
          color: "#4b5563",
          lineHeight: 1.5,
          fontSize: "0.95rem",
        }}
      >
        {description}
      </Typography>

      {children}
    </Box>
  );
};

ProjectDetails.MemberInformation = ({
  student,
  supervisor,
}: {
  student?: User;
  supervisor?: User;
}) => {
  console.log("Student: ", student);

  return (
    <Box
      sx={{
        marginTop: "auto",
        paddingTop: "10px",
        borderTop: "1px dashed #eee",
        display: "flex",
        flexDirection: "column",
        rowGap: "5px",
      }}
    >
      <ProjectDetails.UserRow
        role="Student"
        name={student?.name ?? ""}
        id={student?.userID ?? 0}
      />
      <ProjectDetails.UserRow
        role="Supervisor"
        name={supervisor?.name ?? ""}
        id={supervisor?.userID ?? 0}
      />
    </Box>
  );
};

ProjectDetails.UserRow = ({
  name,
  role,
  id,
}: {
  name: string;
  role: string;
  id: number;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.9rem",
      }}
    >
      <Typography
        component="span"
        sx={{
          fontWeight: 600,
          color: "#333",
          minWidth: "100px",
          marginRight: "1rem",
        }}
      >
        {role}:
      </Typography>

      <Typography
        component="span"
        sx={{
          fontWeight: 400,
          color: "#1f2937",
          flexGrow: 1,
          marginRight: "1rem",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </Typography>

      <Typography
        component="span"
        sx={{
          textAlign: "right",
          fontFamily: "monospace",
          color: "#4b5563",
          minWidth: "60px",
        }}
      >
        {id}
      </Typography>
    </Box>
  );
};

ProjectDetails.Actions = ({
  handleGenerateProgressLogReport,
  onAddStudent,
  isStudentAssigned,
}: {
  handleGenerateProgressLogReport: () => void;
  onAddStudent: () => void;
  isStudentAssigned: boolean;
}) => {
  return (
    <>
      <Divider />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          paddingBottom: "10px",
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={handleGenerateProgressLogReport}
          sx={{
            textTransform: "none",
            width: "100%",
            maxWidth: "300px",
            padding: "6px 12px",
          }}
        >
          Generate Progress Log Report
        </Button>

        <Button
          variant="outlined"
          size="small"
          disabled={isStudentAssigned}
          onClick={onAddStudent}
          color="primary"
          sx={{
            textTransform: "none",
            width: "100%",
            maxWidth: "300px",
            padding: "6px 12px",
          }}
        >
          Add Student
        </Button>
      </Box>

      <Divider />
    </>
  );
};
