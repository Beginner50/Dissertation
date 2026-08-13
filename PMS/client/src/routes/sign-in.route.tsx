import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../providers/auth.provider";
import { Box, Tooltip, Typography, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Header from "../components/header.components/header.component";
import { SignIn } from "../components/auth.components/sign-in.component";

export default function SignInRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { signIn } = useAuth();

  const [authData, setAuthData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = useCallback((email: string) => {
    setAuthData((prev) => ({ ...prev, email }));
  }, []);

  const handlePasswordChange = useCallback((password: string) => {
    setAuthData((prev) => ({ ...prev, password }));
  }, []);

  const handleSignIn = async () => {
    setError("");
    if (!authData.email || !authData.password)
      return setError("All fields are required.");
    if (!authData.email.includes("@"))
      return setError("Please enter a valid email address.");

    setLoading(true);
    try {
      await signIn(authData);
      navigate(`/?${searchParams.toString()}`);
    } catch (err) {
      setError("Sign-in failed. Check your credentials.");
      setAuthData((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !authData.email || !authData.password;

  const testCredentialsTooltip = (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
        Demo Credentials
      </Typography>
      <Typography variant="caption" component="div" sx={{ mb: 1, color: "grey.400" }}>
        Password for all: <strong>password</strong>
      </Typography>
      <Typography variant="body2">
        • <strong>Admin:</strong> admin@uni.com
      </Typography>
      <Typography variant="body2">
        • <strong>Student:</strong> student@uni.com
      </Typography>
      <Typography variant="body2">
        • <strong>Supervisor:</strong> supervisor@uni.com
      </Typography>
    </Box>
  );

  return (
    <>
      <Header>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Header.Brand title="Project Management System" />
          <Tooltip title={testCredentialsTooltip} placement="right" arrow>
            <IconButton size="small" sx={{ color: "action.active" }}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Header>

      <Box sx={{ display: "flex", flexDirection: "column", height: "89.5vh" }}>
        <SignIn>
          <SignIn.Email value={authData.email} handleChange={handleEmailChange} />
          <SignIn.Password
            value={authData.password}
            handleChange={handlePasswordChange}
          />
          <SignIn.Error message={error} />
          <SignIn.Action
            label="Sign In"
            isLoading={loading}
            isDisabled={isInvalid}
            handleAction={handleSignIn}
          />
        </SignIn>
      </Box>
    </>
  );
}
