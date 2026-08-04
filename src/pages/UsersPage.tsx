import { useEffect, useState } from "react";
import type { User } from "../types/user";
import type { Role } from "../types/role";
import apiFetch from "../api/apiFetch";
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import UserDetailsDialog from "../components/UserDetailsDialog";
import CreateUserDialog from "../components/CreateUserDialog";

function UsersPage() {

    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [isRoleLoading, setIsRoleLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

    const handleOpenCreateDialog = () => {
      setCreateDialogOpen(true);
    };
    
    const handleCloseCreateDialog = () => {
      setCreateDialogOpen(false);
    };

    const handleUserClick = (user: User) => {
      setSelectedUser(user);
      setDetailsDialogOpen(true);
    };

    const handleUserClose = () => {
      setDetailsDialogOpen(false);
      setSelectedUser(null);
    };

    const handleUserCreated = (createdUser: User) => {
      setUsers((previousUsers) =>
        [...previousUsers, createdUser].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
  
      setCreateDialogOpen(false);
    };

    useEffect(() => {
        const fetchUsersData = async () => {
          try {
            const response = await apiFetch("/api/users");
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setUsers(data);
          } catch (error) {
            if (error instanceof Error) {
              setError(error.message);
            } else {
              setError("Failed to load Users Data");
            }
          } finally {
            setIsUserLoading(false);
          }
        };

        fetchUsersData();
    }, []);

    useEffect(() => {
        const fetchRolesData = async () => {
          try {
            const response = await apiFetch("/api/roles");
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setRoles(data);
          } catch (error) {
            if (error instanceof Error) {
              setError(error.message);
            } else {
              setError("Failed to load Roles Data");
            }
          } finally {
            setIsRoleLoading(false);
          }
        };

        fetchRolesData();
    }, []);

    return (
        <Box sx={{ padding: 4, maxWidth: 1000, mx: "auto" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Users
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Manage users by team.
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenCreateDialog}
            sx={{ mb: 3 }}
          >
            Create User
          </Button>
          {isUserLoading ? (
            <Typography>Loading...</Typography>
          ) : users.length === 0 ? (
            <Typography>No users found.</Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 3, overflow: "hidden" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        backgroundColor: "primary.main",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        backgroundColor: "primary.main",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      Username
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        backgroundColor: "primary.main",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      Role
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        backgroundColor: "primary.main",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      Created At
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow
                      key={u.id}
                      hover
                      onClick={() => handleUserClick(u)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell
                        align="center"
                        sx={{ borderRight: "1px solid #e0e0e0" }}
                      >
                        {u.name}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ borderRight: "1px solid #e0e0e0" }}
                      >
                        {u.username}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ borderRight: "1px solid #e0e0e0" }}
                      >
                        {u.role.name}
                      </TableCell>
                      <TableCell align="center">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
    
          {selectedUser && (
            <UserDetailsDialog
              selectedUser={selectedUser}
              open={detailsDialogOpen}
              onClose={handleUserClose}
            />
          )}
          {createDialogOpen && (
            <CreateUserDialog
              open={createDialogOpen}
              onClose={handleCloseCreateDialog}
              onUserCreated={handleUserCreated}
              roles={roles}
            />
          )}
        </Box>
    )
}

export default UsersPage