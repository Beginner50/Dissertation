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
import type { User } from "../../lib/types";

export type ModalMode = "create" | "edit" | "delete";
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
    edit: "Edit User",
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

UserModal.UserID = ({ userID }: { userID: number }) => (
  <FormControl fullWidth>
    <TextField label="UserID" value={userID} size="small" disabled />
  </FormControl>
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
      />
    </FormControl>
  );
};

UserModal.Password = ({
  password,
  handlePasswordChange,
}: {
  password: string;
  handlePasswordChange: (v: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(password);
  useEffect(() => setLocalValue(password), [password]);
  useEffect(() => {
    if (password == "") handlePasswordChange(localValue);
  }, [localValue]);

  return (
    <FormControl fullWidth>
      <TextField
        label="Password"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => handlePasswordChange(localValue)}
        size="small"
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
      />
    </FormControl>
  );
};

UserModal.Role = ({
  role,
  handleRoleChange,
}: {
  role: User["role"];
  handleRoleChange: (v: User["role"]) => void;
}) => (
  <FormControl fullWidth>
    <TextField
      select
      label="User Role"
      value={role}
      onChange={(e) => handleRoleChange(e.target.value as User["role"])}
      size="small">
      {/* <MenuItem value="admin">Admin</MenuItem> */}
      <MenuItem value="supervisor">Supervisor</MenuItem>
      <MenuItem value="student">Student</MenuItem>
    </TextField>
  </FormControl>
);

UserModal.DeleteWarning = () => (
  <Alert
    severity="error"
    variant="outlined"
    sx={{ fontWeight: "medium", marginLeft: "1rem", marginRight: "1rem" }}>
    This action is permanent and cannot be undone.
  </Alert>
);

UserModal.Actions = ({
  mode,
  isValid,
  handleCancelClick,
  handleCreateUser,
  handleEditUser,
  handleDeleteUser,
}: {
  mode: ModalMode;
  isValid: boolean;
  handleCancelClick: () => void;
  handleCreateUser: () => void;
  handleEditUser: () => void;
  handleDeleteUser: () => void;
}) => {
  const labels = {
    create: "Create",
    edit: "Edit",
    delete: "Delete",
  };

  const actions = {
    create: handleCreateUser,
    edit: handleEditUser,
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
        color={mode == "delete" ? "error" : "primary"}
        onClick={actions[mode]}
        disabled={!isValid}>
        {labels[mode]}
      </Button>
    </DialogActions>
  );
};
