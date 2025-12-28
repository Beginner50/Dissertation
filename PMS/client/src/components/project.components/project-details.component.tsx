import {
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { User } from "../../lib/types";
import type { ReactNode } from "react";

export function ProjectDetails({
  sx,
  children,
}: {
  sx?: SxProps<Theme>;
  children?: ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3, // Increased padding for better breathability
        borderRadius: 2,
        bgcolor: "rgba(255, 255, 255, 0.73)",
        display: "flex",
        flexDirection: "column",
        gap: 2, // Increased gap
        ...sx,
      }}
    >
      {children}
    </Paper>
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
}) => (
  <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
    <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>

    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
      {description}
    </Typography>

    {children}
  </Stack>
);

ProjectDetails.MemberInformation = ({
  student,
  supervisor,
}: {
  student?: User;
  supervisor?: User;
}) => (
  <Stack
    spacing={1.5}
    sx={{
      mt: "auto",
      pt: 2,
      borderTop: "1px dashed",
      borderColor: "divider",
    }}
  >
    <ProjectDetails.UserRow
      role="Student"
      name={student?.name ?? "Unassigned"}
      id={student?.userID ?? 0}
    />
    <ProjectDetails.UserRow
      role="Supervisor"
      name={supervisor?.name ?? "Unassigned"}
      id={supervisor?.userID ?? 0}
    />
  </Stack>
);

ProjectDetails.UserRow = ({
  name,
  role,
  id,
}: {
  name: string;
  role: string;
  id: number;
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    {/* Moved from caption to body2 (14px) for better readability */}
    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 100 }}>
      {role}:
    </Typography>

    <Typography
      variant="body2"
      sx={{
        flexGrow: 1,
        mx: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: "text.primary",
      }}
    >
      {name}
    </Typography>

    <Typography
      variant="body2"
      sx={{
        fontFamily: "monospace",
        color: "text.secondary",
        fontWeight: 500,
      }}
    >
      {id > 0 ? id : "N/A"}
    </Typography>
  </Stack>
);

ProjectDetails.Actions = ({ children }: { children?: ReactNode }) => (
  <Stack spacing={1} sx={{ py: 1 }}>
    <Divider />
    {children}
    <Divider />
  </Stack>
);

ProjectDetails.GenerateProgressLogReportButton = ({
  handleGenerateProgressLogReport,
}: {
  handleGenerateProgressLogReport: () => void;
}) => {
  return (
    <Button
      variant="contained"
      onClick={handleGenerateProgressLogReport}
      sx={{ textTransform: "none", py: 0.5 }}
    >
      Generate Progress Log Report
    </Button>
  );
};

ProjectDetails.AddStudentButton = ({
  handleAddStudentClick,
  isStudentAssigned,
}: {
  handleAddStudentClick: () => void;
  isStudentAssigned: boolean;
}) => {
  return (
    <Button
      variant="outlined"
      disabled={isStudentAssigned}
      onClick={handleAddStudentClick}
      sx={{ textTransform: "none", py: 0.5 }}
    >
      Add Student
    </Button>
  );
};
