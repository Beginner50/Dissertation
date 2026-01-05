import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Stack,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PageLayout from "../components/layout.components/page-layout.component";
import { useAuth } from "../providers/auth.provider";
import { useNavigate } from "react-router";

export default function SignInRoute() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    console.log({ email, password });

    try {
      await signIn({ email, password });
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Sign-in failed. Check your credentials.");
    }

    setEmail("");
    setPassword("");
  };

  return (
    <PageLayout.SignIn>
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
          }}
        >
          <LockOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}

              {/* Email */}
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
              />

              {/* Password */}
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                Sign In
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>
    </PageLayout.SignIn>
  );
}
