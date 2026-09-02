import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Stack,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Switch,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import apiFetch from "../api/apiFetch";
import type { UserPermission } from "../types/userPermission";
import type { UserPermissionsResponse } from "../types/userPermissionsResponse";

function UserDetailsDialog({
    selectedUser,
    open,
    onClose,
}) {

    const [permissions, setPermissions] = useState<UserPermission[]>([]);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [permissionsError, setPermissionsError] = useState<string | null>(null);
    const [savingPermissions, setSavingPermissions] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handlePermissionToggle = (permissionId: number) => {
      setPermissions((currentPermissions) =>
        currentPermissions.map((permission) => {
          if (permission.id !== permissionId) {
            return permission;
          }
        
          const newEffective = !permission.effective;
        
          return {
            ...permission,
            effective: newEffective,
          
            // If the new value matches the role default,
            // no override is necessary.
            override:
              newEffective === permission.roleGranted
                ? null
                : newEffective,
          };
        })
      );
    };

    const handleSavePermissions = async () => {
      if (!selectedUser) {
        return;
      }
    
      setSavingPermissions(true);
      setSaveError(null);
    
      try {
        const overrides = permissions
          .filter((permission) => permission.override !== null)
          .map((permission) => ({
            permissionId: permission.id,
            granted: permission.override as boolean,
          }));
        
        const response = await apiFetch(
          `/api/users/${selectedUser.id}/permissions`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              overrides,
            }),
          }
        );
      
        if (!response.ok) {
          throw new Error("Failed to save permissions.");
        }
      
        onClose();
      } catch (error) {
        console.error(error);
        setSaveError("Failed to save permission changes.");
      } finally {
        setSavingPermissions(false);
      }
    };

    async function handleResetPermissions() {
      if (!selectedUser) {
        return;
      }
    
      setSavingPermissions(true);
      setSaveError(null);
    
      try {
        const response = await apiFetch(
          `/api/users/${selectedUser.id}/permissions`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              overrides: [],
            }),
          }
        );
      
        if (!response.ok) {
          throw new Error("Failed to reset permissions.");
        }
      
        const refreshedResponse = await apiFetch(
          `/api/users/${selectedUser.id}/permissions`
        );
      
        if (!refreshedResponse.ok) {
          throw new Error("Failed to reload permissions.");
        }
      
        const data: UserPermissionsResponse =
          await refreshedResponse.json();
      
        setPermissions(data.permissions);
      } catch (error) {
        console.error(error);
        setSaveError("Failed to reset permissions.");
      } finally {
        setSavingPermissions(false);
      }
    }

    useEffect(() => {
      if (!open || !selectedUser) {
        return;
      }
    
      const fetchPermissions = async () => {
        setPermissionsLoading(true);
        setPermissionsError(null);
      
        try {
          const response = await apiFetch(
            `/api/users/${selectedUser.id}/permissions`
          );
        
          if (!response.ok) {
            throw new Error("Failed to load permissions.");
          }
        
          const data: UserPermissionsResponse = await response.json();
        
          setPermissions(data.permissions);
        } catch (error) {
          console.error(error);
          setPermissionsError("Failed to load user permissions.");
        } finally {
          setPermissionsLoading(false);
        }
      };
    
      fetchPermissions();
    }, [open, selectedUser]);

    const permissionsByModule = permissions.reduce<Record<string, UserPermission[]>>(
      (groups, permission) => {
        if (!groups[permission.module]) {
          groups[permission.module] = [];
        }
      
        groups[permission.module].push(permission);
      
        return groups;
      },
      {}
    );

    return (
        <Dialog 
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            slotProps={{
              paper: {
                sx: { borderRadius: 3 },
              },
            }}
        >
        <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>User Details</DialogTitle>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
                <CloseIcon />
            </IconButton>
        <DialogContent>
          {selectedUser && (
            <div>
                <Stack direction="row" sx={{ justifyContent:'space-between', alignItems:'center'}}>
                    <Box
                        sx={{
                            mb: 3,
                            p: 2,
                          }}
                        >
                        <Typography sx={{ mb:1 }}><strong>Name:</strong>  {selectedUser.name}</Typography>
                        <Typography sx={{ mb:1 }}><strong>Username:</strong> {selectedUser.username}</Typography>
                        <Typography sx={{ mb:1 }}><strong>Role:</strong> {selectedUser.role.name}</Typography>
                        <Typography ><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Permissions
                </Typography>
                                        
                {permissionsLoading && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                )}
                
                {permissionsError && (
                  <Alert severity="error">
                    {permissionsError}
                  </Alert>
                )}
                
                {!permissionsLoading && !permissionsError && (
                <Stack spacing={3}>
                  {Object.entries(permissionsByModule).map(
                    ([module, modulePermissions]) => (
                      <Box key={module}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            textTransform: "capitalize",
                            mb: 1,
                          }}
                        >
                          {module.replaceAll("_", " ")}
                        </Typography>
                        
                        <Stack spacing={1}>
                          {modulePermissions.map((permission) => (
                            <Box
                              key={permission.id}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 0.5,
                              }}
                            >
                              <Box>
                                <Typography>
                                  {permission.description ?? permission.key}
                                </Typography>
                              </Box>
                            
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems:"center" }}
                              >
                                <Typography
                                  variant="caption"
                                  color={
                                    permission.override !== null
                                      ? "primary.main"
                                      : "text.secondary"
                                  }
                                >
                                  {permission.override !== null
                                    ? "Custom"
                                    : "Role"}
                                </Typography>
                                  
                                <Switch
                                  checked={permission.effective}
                                  onChange={() =>
                                    handlePermissionToggle(permission.id)
                                  }
                                />
                              </Stack>
                            </Box>
                          ))}
                          
                        </Stack>
                        
                      </Box>
                    )
                  )}

                  {saveError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {saveError}
                    </Alert>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 3,
                    }}
                  >
                    <Button
                      onClick={handleResetPermissions}
                      disabled={savingPermissions}
                      sx={{ mr: 2 }}
                    >
                      Reset to Role Defaults
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSavePermissions}
                      disabled={savingPermissions}
                    >
                      {savingPermissions ? "Saving..." : "Save Permissions"}
                    </Button>
                  </Box>
                </Stack>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
}

export default UserDetailsDialog;