import { Alert, AlertTitle, Snackbar } from "@mui/material";

export const GlobalError = ({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) => {
  return (
    <Snackbar
      open={!!message}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ mt: 2 }}>
      <Alert
        severity="error"
        onClose={onClose}
        variant="filled"
        data-testid="global-error"
        sx={{ width: "100%", boxShadow: 6, whiteSpace: "pre-line" }}>
        <AlertTitle>System Error</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};
