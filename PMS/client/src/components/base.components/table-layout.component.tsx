import { Stack, Typography, Button, Box, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { theme } from "../../lib/theme";
import { UploadFile } from "@mui/icons-material";
import type { ReactNode } from "react";

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
  onIngest,
  isPending,
}: {
  text: string;
  onIngest: (file: File) => void;
  isPending: boolean;
}) => {
  const handleFileClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv, .xlsx, .xls";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onIngest(file);
    };
    input.click();
  };

  return (
    <Button
      variant="contained"
      startIcon={<UploadFile />}
      onClick={handleFileClick}
      disabled={isPending}
      loading={isPending}
      sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 600, ml: 1 }}>
      {text}
    </Button>
  );
};

TableLayout.Content = ({ children }: { children: React.ReactNode }) => (
  <Box>{children}</Box>
);
