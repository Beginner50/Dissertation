import { theme } from "../../lib/theme";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
  type SxProps,
} from "@mui/material";
import type { Theme } from "@emotion/react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CommentIcon from "@mui/icons-material/Comment";
import PolicyIcon from "@mui/icons-material/Policy";
import SendIcon from "@mui/icons-material/Send";
import { useRef, type ReactNode } from "react";
import { CloudUpload, Lock, LockOpen, LockOutlined } from "@mui/icons-material";

export default function TaskActions({
  sx,
  children,
}: {
  sx?: SxProps<Theme> | undefined;
  children?: ReactNode;
}) {
  return (
    <Box
      sx={{
        padding: "1rem",
        background: "white",
        borderRadius: "8px",
        overflowY: "auto",
        border: `1px solid ${theme.borderSoft}`,
        boxShadow: theme.shadowSoft,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        ...sx,
      }}>
      {children}
    </Box>
  );
}

TaskActions.Header = ({ title }: { title: string }) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          paddingBottom: "0.5rem",
        }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: "1.2rem",
            fontFamily: "sans-serif",
            fontWeight: 600,
            color: "black",
            margin: 0,
            padding: "2px",
            alignSelf: "end",
          }}>
          {title}
        </Typography>
      </Box>
      <Divider
        sx={{
          marginBottom: "0.7rem",
        }}
      />
    </>
  );
};

TaskActions.DeliverableUpload = ({
  handleFileUpload,
  taskLocked,
}: {
  handleFileUpload: (file: File) => void;
  taskLocked: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box
      sx={{
        borderWidth: "2px",
        borderStyle: "dashed",
        borderColor: taskLocked ? "divider" : theme.link,
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        cursor: taskLocked ? "not-allowed" : "pointer",
        backgroundColor: taskLocked ? "#f5f5f5" : "#f8fbfc",
        opacity: taskLocked ? 0.8 : 1,
        transition: "all 0.2s",
        ":hover": !taskLocked
          ? {
              borderColor: theme.linkFocused,
              backgroundColor: "#f0f4f9",
            }
          : {},
      }}
      onClick={() => !taskLocked && fileInputRef.current?.click()}>
      {taskLocked ? (
        <LockOutlined sx={{ color: "text.disabled", fontSize: "2rem" }} />
      ) : (
        <CloudUpload sx={{ color: theme.link, fontSize: "2rem" }} />
      )}

      <Typography
        variant="body2"
        sx={{
          color: taskLocked ? "text.disabled" : theme.textNormal,
          fontWeight: 500,
          marginTop: "4px",
        }}>
        {taskLocked ? "Task is Locked" : "Click to Upload Deliverable"}
      </Typography>

      <Typography variant="caption" sx={{ color: theme.textMuted }}>
        {taskLocked
          ? "Deliverable Uploads and Submissions are disabled by the supervisor."
          : "File Type: .pdf"}
      </Typography>

      {!taskLocked && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) handleFileUpload(file);
            e.target.value = "";
          }}
          hidden
          accept=".pdf"
        />
      )}
    </Box>
  );
};

TaskActions.Actions = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}>
      {children}
    </Box>
  );
};

TaskActions.ProvideFeedbackButton = ({
  onClick,
  hasPreviousCriteria,
  disabled = false,
}: {
  onClick: () => void;
  hasPreviousCriteria: boolean;
  disabled?: boolean;
}) => {
  return (
    <Button
      variant="outlined"
      color="primary"
      size="medium"
      disabled={disabled}
      fullWidth
      startIcon={<CommentIcon />}
      onClick={onClick}>
      {hasPreviousCriteria ? "Update Feedback" : "Provide Feedback"}
    </Button>
  );
};

TaskActions.LockTaskButton = ({
  onLockTaskClick,
  isLocked,
}: {
  onLockTaskClick: () => void;
  isLocked: boolean;
}) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      size="medium"
      fullWidth
      onClick={onLockTaskClick}
      startIcon={isLocked ? <LockOpen /> : <Lock />}
      sx={{
        transition: "background-color 0.3s ease, color 0.3s ease",
        backgroundColor: isLocked ? "#9c27b01a" : "transparent",
        borderColor: "secondary.main",
        color: "secondary.main",
        "&:hover": {
          backgroundColor: isLocked ? "#9c27b026" : "#9c27b00d",
          borderColor: "secondary.main",
        },
      }}>
      {isLocked ? "Unlock Task" : "Lock Task"}
    </Button>
  );
};

TaskActions.CheckComplianceButton = ({
  onClick,
  disabled = false,
  isLoading,
}: {
  onClick: () => void;
  disabled?: boolean;
  isLoading: boolean;
}) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      size="medium"
      disabled={disabled}
      fullWidth
      startIcon={<PolicyIcon />}
      endIcon={isLoading ? <CircularProgress color="inherit" size="20px" /> : <></>}
      onClick={onClick}>
      Check Compliance
    </Button>
  );
};

TaskActions.SubmitDeliverableButton = ({
  onClick,
  disabled = false,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button
      variant="contained"
      color="success"
      size="medium"
      disabled={disabled}
      fullWidth
      startIcon={<SendIcon />}
      onClick={onClick}>
      Submit Deliverable
    </Button>
  );
};
