import type { Theme } from "@emotion/react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormGroup,
  MenuItem,
  Stack,
  TextField,
  type SxProps,
  type TextFieldProps,
} from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import type { ModalActions } from "../../lib/types";
import { ExtensionSharp } from "@mui/icons-material";

export default function Modal({
  open,
  children,
  sx,
}: {
  open: boolean;
  children?: ReactNode;
  sx?: SxProps<Theme> | undefined;
}) {
  return (
    <Dialog
      fullWidth
      open={open}
      slotProps={{
        paper: {
          sx: { mx: "auto", ...sx },
        },
      }}
      keepMounted>
      {children}
    </Dialog>
  );
}

Modal.Header = ({ mode, item }: { mode: ModalActions; item: string }) => {
  const titles: Record<ModalActions, string> = {
    create: `Create New ${item}`,
    edit: `Edit ${item} Details`,
    delete: `Delete ${item}`,
    archive: `Archive ${item}`,
    restore: `Restore ${item}`,
  };
  return <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>{titles[mode]}</DialogTitle>;
};

Modal.Fields = ({ children }: { children: ReactNode }) => {
  return (
    <DialogContent dividers>
      <FormGroup>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {children}
        </Stack>
      </FormGroup>
    </DialogContent>
  );
};

Modal.TextField = <T extends string | number>({
  label,
  value,
  handleValueChange = (localValue: T) => {},
  ...textFieldProps
}: {
  label: string;
  value: T;
  handleValueChange?: (localValue: T) => void;
} & TextFieldProps) => {
  const [localValue, setLocalValue] = useState(value);

  /*
    1st useEffect: 
        Syncing localValue with value prop changes (e.g., when editing a different item), 

    2nd useEffect: 
        Syncing value prop with localValue changes, but only when either is empty.

        The reason for this condition is that keeping them in sync at all times leads to performance
        issues. However, since the form validation logic considers empty values as invalid, we need
        to ensure that when the localValue changes from an empty string to a non-empty string (or vice versa),
        the submit button is enabled/disabled;
  */
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (value == "" || localValue == "") handleValueChange(localValue);
  }, [localValue]);

  return (
    <FormControl fullWidth>
      <TextField
        {...textFieldProps}
        label={label}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value as T)}
        onBlur={() => handleValueChange(localValue)}
        size="small"
      />
    </FormControl>
  );
};

Modal.DateTimePicker = ({
  label,
  value,
  handleValueChange,
  disabled = false,
}: {
  label: string;
  value: Date;
  handleValueChange: (newValue: Date | null) => void;
  disabled?: boolean;
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        label={label}
        value={value}
        onChange={handleValueChange}
        disabled={disabled}
        minDateTime={new Date()}
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
            inputProps: {
              "data-testid": "datetime_picker",
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

Modal.Select = <T extends string | number>({
  label,
  currentOption,
  options,
  handleOptionChange,
}: {
  label: string;
  currentOption: T;
  options: Record<string, T>;
  handleOptionChange: (option: T) => void;
}) => {
  return (
    <FormControl fullWidth>
      <TextField
        select
        label={label}
        value={currentOption}
        onChange={(e) => handleOptionChange(e.target.value as T)}
        size="small">
        {Object.entries(options).map(([label, value]) => (
          <MenuItem value={value}>{label}</MenuItem>
        ))}
      </TextField>
    </FormControl>
  );
};

Modal.Actions = ({
  mode,
  loading,
  disabled,
  handleCancelClick,
  handleCreateItem,
  handleEditItem,
  handleDeleteItem,
  handleArchiveItem,
  handleRestoreItem,
}: {
  mode: ModalActions;
  loading: boolean;
  disabled: boolean;
  handleCancelClick: () => void;
  handleCreateItem?: () => void;
  handleEditItem?: () => void;
  handleDeleteItem?: () => void;
  handleArchiveItem?: () => void;
  handleRestoreItem?: () => void;
}) => {
  const labels: Record<ModalActions, string> = {
    create: "Create",
    edit: "Save",
    delete: "Delete",
    archive: "Archive",
    restore: "Restore",
  };
  const actions: Record<ModalActions, (() => void) | undefined> = {
    create: handleCreateItem,
    edit: handleEditItem,
    delete: handleDeleteItem,
    archive: handleArchiveItem,
    restore: handleRestoreItem,
  };

  return (
    <DialogActions sx={{ p: 2, px: 3 }}>
      <Button onClick={handleCancelClick} color="inherit">
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={actions[mode]}
        color={mode === "delete" || mode == "archive" ? "error" : "primary"}
        loading={loading}
        disabled={disabled}>
        {labels[mode]}
      </Button>
    </DialogActions>
  );
};

Modal.Warning = ({ message }: { message: string }) => (
  <DialogContent dividers>
    <Alert severity="warning" variant="outlined" sx={{ fontWeight: "medium" }}>
      <strong>Warning:</strong> {message}
    </Alert>
  </DialogContent>
);
