import { Stack, Typography, Button, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { theme } from "../../lib/theme";

export default function TableLayout({ children }: { children: React.ReactNode }) {
  return <Stack spacing={3}>{children}</Stack>;
}

TableLayout.Header = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="h5" fontWeight="700" color={theme.textStrong}>
      {title}
    </Typography>
    <Stack direction="row" spacing={2} alignItems="center">
      {children}
    </Stack>
  </Stack>
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

TableLayout.Content = ({ children }: { children: React.ReactNode }) => (
  <Box>{children}</Box>
);
