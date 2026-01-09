import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Button,
  FormGroup,
  FormControl,
  MenuItem,
  Typography,
} from "@mui/material";
import { theme } from "../../lib/theme";

export type ModalMode = "create" | "delete";
export type ModalState = {
  mode: ModalMode;
  open: boolean;
};

export default function UserModal({
  open,
  children,
}: {
  open: boolean;
  children?: ReactNode;
}) {
  return (
    <Dialog
      fullWidth
      open={open}
      slotProps={{
        paper: {
          sx: { maxWidth: "40vw", mx: "auto", borderRadius: "12px" },
        },
      }}>
      {children}
    </Dialog>
  );
}

UserModal.Header = ({ mode }: { mode: ModalMode }) => {
  const titles = {
    create: "Create New User",
    delete: "Delete User",
  };
  return (
    <DialogTitle sx={{ fontWeight: "bold", pb: 1, color: theme.textStrong }}>
      {titles[mode]}
    </DialogTitle>
  );
};

UserModal.Fields = ({ children }: { children: ReactNode }) => (
  <DialogContent dividers sx={{ py: 3 }}>
    <FormGroup>
      <Stack spacing={2.5}>{children}</Stack>
    </FormGroup>
  </DialogContent>
);

UserModal.Name = ({
  name,
  handleNameChange,
}: {
  name: string;
  handleNameChange: (v: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(name);
  useEffect(() => setLocalValue(name), [name]);
  useEffect(() => {
    if (name == "") handleNameChange(localValue);
  }, [localValue]);

  return (
    <FormControl fullWidth>
      <TextField
        label="Full Name"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => handleNameChange(localValue)}
        size="small"
        placeholder="e.g. John Doe"
      />
    </FormControl>
  );
};

UserModal.Email = ({
  email,
  handleEmailChange,
}: {
  email: string;
  handleEmailChange: (v: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(email);
  useEffect(() => setLocalValue(email), [email]);
  useEffect(() => {
    if (email == "") handleEmailChange(localValue);
  }, [localValue]);

  return (
    <FormControl fullWidth>
      <TextField
        label="Email Address"
        type="email"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => handleEmailChange(localValue)}
        size="small"
        placeholder="john.doe@example.com"
      />
    </FormControl>
  );
};

UserModal.Role = ({
  role,
  handleRoleChange,
}: {
  role: string;
  handleRoleChange: (v: string) => void;
}) => (
  <FormControl fullWidth>
    <TextField
      select
      label="User Role"
      value={role}
      onChange={(e) => handleRoleChange(e.target.value)}
      size="small">
      {/* <MenuItem value="admin">Admin</MenuItem> */}
      <MenuItem value="instructor">Instructor</MenuItem>
      <MenuItem value="student">Student</MenuItem>
    </TextField>
  </FormControl>
);

UserModal.DeleteWarning = ({ userName }: { userName: string }) => (
  <Stack spacing={2}>
    <Alert severity="error" variant="outlined" sx={{ fontWeight: "medium" }}>
      This action is permanent and cannot be undone.
    </Alert>
    <Typography sx={{ px: 1 }}>
      Are you sure you want to delete the user <strong>{userName}</strong>? They will lose
      all access to the system immediately.
    </Typography>
  </Stack>
);

UserModal.Actions = ({
  mode,
  isValid,
  handleCancelClick,
  handleCreateUser,
  handleDeleteUser,
}: {
  mode: ModalMode;
  isValid: boolean;
  handleCancelClick: () => void;
  handleCreateUser: () => void;
  handleDeleteUser: () => void;
}) => {
  const labels = {
    create: "Create",
    delete: "Delete",
  };

  const actions = {
    create: handleCreateUser,
    delete: handleDeleteUser,
  };

  return (
    <DialogActions sx={{ p: 2, px: 3, backgroundColor: "#f8f8f8" }}>
      <Button
        onClick={handleCancelClick}
        sx={{ color: theme.textStrong, textTransform: "none" }}>
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={actions[mode]}
        disabled={!isValid}
        color={mode == "delete" ? "error" : "primary"}>
        {labels[mode]}
      </Button>
    </DialogActions>
  );
};
