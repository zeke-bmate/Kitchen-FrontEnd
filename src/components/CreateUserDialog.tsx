import { useState } from "react";
import type { Role } from "../types/role";
import type { User } from "../types/user";
import { Dialog, Box, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, DialogActions, Button, Alert, FormHelperText, IconButton, InputAdornment, Stack, TextField, type SelectChangeEvent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import apiFetch from "../api/apiFetch";

type CreateUserDialogProps = {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onUserCreated: (user: User) => void;
};

function CreateUserDialog({
  open,
  roles,
  onClose,
  onUserCreated,
}: CreateUserDialogProps) {

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [roleError, setRoleError] = useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] =
      useState<string | null>(null);

    const handleNameChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setNameError(null);
      setName(event.target.value);
    };

    const handleUsernameChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setUsernameError(null);
      setUsername(event.target.value);
    };

    const handlePasswordChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setPasswordError(null);
      setPassword(event.target.value);
    };

    const handleRoleChange = (
      event: SelectChangeEvent<string>
    ) => {
      setRoleError(null);
      setSelectedRoleId(event.target.value);
    };

    const handleConfirmPasswordChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setConfirmPasswordError(null);
      setConfirmPassword(event.target.value);
    };

    const handleSubmit = async (
      event: React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();
      const trimmedName = name.trim();  
      const trimmedUsername = username.trim();
      const roleId = Number(selectedRoleId);

      setNameError(null);
      setUsernameError(null);
      setPasswordError(null);
      setConfirmPasswordError(null);
      setRoleError(null);
      setFormError(null);

      if (!trimmedName) {
          setNameError("Name must be a non-empty String.")
          return;
      }
      
      if (!trimmedUsername) {
          setUsernameError("Username must be a non-empty String.")
          return;
      }
      
      if (!password) {
          setPasswordError("Password must be a non-empty String.")
          return;
      }
      
      if (password !== confirmPassword) {
          setConfirmPasswordError("Passwords must match.")
          return;
      }
      
      if (Number.isNaN(roleId) || roleId <= 0) {
          setRoleError("Role must be selected.")
          return;
      }

      setSubmitting(true);

      const data = {
          name: trimmedName,
          username: trimmedUsername,
          password,
          roleId,
      };

      try {
            const response = await apiFetch("/api/users", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });
        
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to create user");
            }
            const createdUser = await response.json();

            onUserCreated(createdUser);
            setName("");
            setUsername("");
            setSelectedRoleId("");
            setPassword("");
            setConfirmPassword("");
          } catch (error) {
            if (error instanceof Error) {
              setFormError(error.message);
            } else {
              setFormError("Failed to create user.");
            }
          } finally {
            setSubmitting(false);
          }
    }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>New User</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 1, mb: 3 }}>
            <TextField
              error={!!nameError}
              helperText={nameError ? nameError : ""}
              label="Name"
              value={name}
              onChange={handleNameChange}
              type="name"
            />
            <TextField
              error={!!usernameError}
              helperText={usernameError ? usernameError : ""}
              label="Username"
              value={username}
              onChange={handleUsernameChange}
              type="username"        
            />
            <FormControl error={!!roleError} sx={{ minWidth: 200 }}>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                value={selectedRoleId}
                onChange={handleRoleChange}
                label="Role"
                labelId="role-select-label"
              >
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
              {!!roleError && (
                <FormHelperText>{roleError}</FormHelperText>
              )}
            </FormControl>
            <TextField
              error={!!passwordError}
              helperText={passwordError ? passwordError : ""}
              label="Password"
              value={password}
              onChange={handlePasswordChange}
              type="password"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError ?? ""}
            />
          </Stack>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Creating..." : "Create User"}
            </Button>
          </Box>
        </form>
        {formError && <Alert severity="error">{formError}</Alert>}
      </DialogContent>
    </Dialog>
  );
}

export default CreateUserDialog