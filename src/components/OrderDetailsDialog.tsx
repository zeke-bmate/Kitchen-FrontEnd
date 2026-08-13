import { Dialog, DialogTitle, DialogContent, Typography, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, Stack } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import type { OrderDetails } from "../types/orders";

type OrderDetailsDialogProps = {
    selectedOrder: OrderDetails | null;
    open: boolean;
    onClose: () => void;
};

const formatLocation = (location: OrderDetails["location"]) => {
  switch (location) {
    case "DEE_PLACE":
      return "DeePlace";
    case "ECHO_POKER":
      return "Echo Poker";
    case "ECHO_EVENTS":
      return "Echo Events";
    default:
      return "Not specified";
  }
};

function OrderDetailsDialog({
    selectedOrder,
    open,
    onClose,
}: OrderDetailsDialogProps) {
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
        <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>Order Details</DialogTitle>
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
          {selectedOrder && (
            <div>
                <Stack direction="row" sx={{ justifyContent:'space-between', alignItems:'center'}}>
                    <Box
                        sx={{
                            mb: 3,
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                          }}
                        >
                        <Typography sx={{ mb:1 }}><strong>Order:</strong>  {selectedOrder.recipe?.name ?? "No Recipe"}</Typography>
                        <Typography sx={{ mb:1 }}><strong>Servings:</strong>  {selectedOrder.quantity}</Typography>
                        <Typography sx={{ mb: 1 }}><strong>Location:</strong>{" "} {formatLocation(selectedOrder.location)} </Typography>
                        <Typography sx={{ mb:1 }}><strong>Current Status:</strong>  {selectedOrder.status}</Typography>
                        <Typography sx={{ mb:1 }}><strong>Created Date:</strong>  {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
                    </Box>
                </Stack>

                <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>Previous Status</TableCell>
                                <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'  }}>New Status</TableCell>
                                <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'  }}>Changed At</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { selectedOrder.statusLogs.map((s) => (
                                <TableRow key={s.id} >
                                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{s.previousStatus ?? "---------"}</TableCell>
                                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{s.newStatus}</TableCell>
                                    <TableCell align="center" >{new Date(s.createdAt).toLocaleString()}</TableCell>
                                </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
}

export default OrderDetailsDialog;