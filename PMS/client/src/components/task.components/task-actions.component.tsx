import { theme } from "../../lib/theme";
import { Box, Button, Divider, Typography, type SxProps } from "@mui/material";
import type { Theme } from "@emotion/react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CommentIcon from "@mui/icons-material/Comment";
import PolicyIcon from "@mui/icons-material/Policy";
import SendIcon from "@mui/icons-material/Send";
import { useRef, type ReactNode } from "react";
import type { DeliverableFile } from "../../lib/types";

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
      }}
    >
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
        }}
      >
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
          }}
        >
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
}: {
  handleFileUpload: (file: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box
      sx={{
        borderWidth: "2px",
        borderStyle: "dashed",
        borderColor: theme.link,
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: "#f8fbfc",
        transition: "all 0.2s",
        ":hover": {
          borderColor: theme.linkFocused,
          backgroundColor: "#f0f4f9",
        },
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <CloudUploadIcon sx={{ color: theme.link, fontSize: "2rem" }} />
      <Typography
        variant="body2"
        sx={{ color: theme.textNormal, fontWeight: 500, marginTop: "4px" }}
      >
        Click to Upload Deliverable
      </Typography>
      <Typography variant="caption" sx={{ color: theme.textMuted }}>
        File Type: .pdf
      </Typography>
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
    </Box>
  );
};

TaskActions.ActionButtonContainer = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {children}
    </Box>
  );
};

TaskActions.ProvideFeedbackButton = ({
  handleProvideFeedbackClick,
  disabled = false,
}: {
  handleProvideFeedbackClick: () => void;
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
      onClick={handleProvideFeedbackClick}
    >
      Provide Feedback
    </Button>
  );
};

TaskActions.CheckComplianceButton = ({
  handleCheckComplianceClick,
  disabled = false,
}: {
  handleCheckComplianceClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      size="medium"
      disabled={disabled}
      fullWidth
      startIcon={<PolicyIcon />}
      onClick={handleCheckComplianceClick}
    >
      Check Compliance
    </Button>
  );
};

TaskActions.SubmitDeliverableButton = ({
  handleSubmitDeliverableClick,
  disabled = false,
}: {
  handleSubmitDeliverableClick: () => void;
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
      onClick={handleSubmitDeliverableClick}
    >
      Submit Deliverable
    </Button>
  );
};
