import {
  Stack,
  Typography,
  Button,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Tooltip,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { theme } from "../../lib/theme";
import { InfoOutlined, UploadFile } from "@mui/icons-material";
import { useRef, type ChangeEvent, type ReactNode } from "react";

export default function TableLayout({
  children,
  spacing = 3,
}: {
  children: ReactNode;
  spacing?: number;
}) {
  return <Stack spacing={spacing}>{children}</Stack>;
}

TableLayout.Header = ({
  title,
  children,
  variant = "default", // Add this prop
}: {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "integrated";
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{
      pb: variant === "integrated" ? 1.5 : 0,
      borderBottom: variant === "integrated" ? `1px solid ${theme.borderSoft}` : "none",
      mb: variant === "integrated" ? 0 : 0,
    }}>
    <Typography
      variant={variant === "integrated" ? "h6" : "h5"}
      fontWeight="700"
      color={theme.textStrong}>
      {title}
    </Typography>
    <Stack direction="row" spacing={2} alignItems="center">
      {children}
    </Stack>
  </Stack>
);

TableLayout.Toolbar = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 20px",
      backgroundColor: "#fff",
      border: `1px solid ${theme.borderSoft}`,
      borderBottom: "none",
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px",
    }}>
    <Typography variant="h6" fontWeight="700" color={theme.textStrong}>
      {title}
    </Typography>
    <Stack direction="row" spacing={1}>
      {children}
    </Stack>
  </Box>
);

TableLayout.AddButton = ({ text, onClick }: { text: string; onClick: () => void }) => (
  <Button
    variant="outlined"
    size="small"
    startIcon={<AddIcon />}
    sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 600 }}
    onClick={onClick}>
    {text}
  </Button>
);

TableLayout.IngestButton = ({
  text,
  handleIngest,
  requiredColumns,
  isPending,
}: {
  text: string;
  handleIngest: (file: File) => void;
  requiredColumns: string[];
  isPending: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleIngest(file);
    }
    e.target.value = "";
  };

  return (
    <Tooltip
      title={`Required Columns: ${requiredColumns.join(", ")}`}
      placement="top"
      arrow>
      <span>
        <Button
          variant="contained"
          startIcon={<UploadFile />}
          onClick={handleButtonClick}
          disabled={isPending}
          loading={isPending}
          sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 600, ml: 1 }}>
          {text}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .xlsx, .xls"
          style={{ display: "none" }}
          data-testid="hidden-file-input"
        />
      </span>
    </Tooltip>
  );
};

TableLayout.Content = ({ children }: { children: React.ReactNode }) => (
  <Box>{children}</Box>
);
