import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  TextField,
  Alert,
  FormControl,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useState, useEffect, type ReactNode } from "react";

export function SignIn({ children }: { children: ReactNode }) {
  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}>
        <LockOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Sign In
        </Typography>
        <Stack spacing={2} sx={{ width: "100%" }}>
          {children}
        </Stack>
      </Box>
    </Container>
  );
}

SignIn.Error = ({ message }: { message: string }) =>
  message ? <Alert severity="error">{message}</Alert> : null;

SignIn.Email = ({
  value,
  handleChange,
}: {
  value: string;
  handleChange: (v: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => setLocalValue(value), [value]);

  useEffect(() => {
    if (value == "" || localValue == "") handleChange(localValue);
  }, [localValue]);

  return (
    <FormControl fullWidth>
      <TextField
        label="Email Address"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => handleChange(localValue)}
        size="small"
      />
    </FormControl>
  );
};

SignIn.Password = ({
  value,
  handleChange,
}: {
  value: string;
  handleChange: (v: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => setLocalValue(value), [value]);

  useEffect(() => {
    if (value == "" || localValue == "") handleChange(localValue);
  }, [localValue]);

  return (
    <FormControl fullWidth>
      <TextField
        label="Password"
        type="password"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => handleChange(localValue)}
        size="small"
      />
    </FormControl>
  );
};

SignIn.Action = ({
  label,
  isLoading,
  isDisabled,
  handleAction,
}: {
  label: string;
  isLoading: boolean;
  isDisabled: boolean;
  handleAction: () => void;
}) => (
  <Button
    variant="contained"
    fullWidth
    onClick={handleAction}
    loading={isLoading}
    disabled={isDisabled}
    sx={{ mt: 3, mb: 2, py: 1.5 }}>
    {label}
  </Button>
);
