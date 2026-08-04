import { Dialog, DialogTitle, IconButton, DialogContent, Stack, Box, Typography, Divider, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

function UserDetailsDialog({
    selectedUser,
    open,
    onClose,
}) {
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
}

export default UserDetailsDialog;