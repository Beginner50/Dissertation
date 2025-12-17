import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Stack,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export const Route = createFileRoute('/signin')({
  component: RouteComponent,
});

function RouteComponent() {
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Basic Validation ---
    if (!id || !email || !password) {
      setError('All fields are required.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // --- Simulation of Authentication ---
    console.log({ id, email, password });

    // In a real application, you would make an API call here:
    // try {
    //   await authService.signIn(id, email, password);
    //   setSuccess('Sign-in successful! Redirecting...');
    //   // router.navigate({ to: '/' });
    // } catch (err) {
    //   setError('Sign-in failed. Check your credentials.');
    // }

    setSuccess('Sign-in attempt successful! Check console for data.');

    // Clear the form after simulated successful sign-in
    setId('');
    setEmail('');
    setPassword('');
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <LockOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Sign In
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {/* ID Field */}
            <TextField
              required
              fullWidth
              id="id"
              label="User ID"
              name="id"
              autoComplete="username"
              value={id}
              onChange={(e) => setId(e.target.value)}
              variant="outlined"
            />

            {/* Email Field */}
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

            {/* Password Field */}
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
  );
}