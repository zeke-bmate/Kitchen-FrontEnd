import { useEffect, useState } from "react";
import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  TableContainer,
  Paper,
  Box,
  Stack,
} from "@mui/material";

import type { RawIngredient } from "../types/rawIngredient";
import type { InventoryTransaction } from "../types/inventoryTransaction";
import apiFetch from "../api/apiFetch";
import CloseIcon from '@mui/icons-material/Close';
import type { MeasurementUnit } from "../types/measurementUnit";

const formatUnit = (unit: MeasurementUnit) => {
  switch (unit) {
    case "KG":
      return "kg";
    case "L":
      return "L";
    case "EACH":
      return "each";
    case "BUNCH":
      return "bunch";
    case "HEAD":
      return "head";
  }
};

const formatLocation = (location: string) => {
  switch (location) {
    case "ECHO_KITCHEN":
      return "Echo Kitchen";
    case "DEE_PLACE":
      return "DeePlace";
    case "ECHO_POKER":
      return "Echo Poker";
    case "ECHO_EVENTS":
      return "Echo Events";
    default:
      return location;
  }
};

type InventoryHistoryDialogProps = {
  open: boolean;
  ingredient: RawIngredient | null;
  onClose: () => void;
};

const getSourceOrReason = (
  transaction: InventoryTransaction
) => {
  if (transaction.type === "PURCHASE") {
    if (!transaction.purchase) {
      return "Purchase";
    }

    return `${transaction.purchase.supplier.name} — ${new Date(
      transaction.purchase.date
    ).toLocaleDateString()}`;
  }

  if (transaction.type === "PRODUCTION") {
    if (!transaction.productionBatch) {
      return "Production";
    }

    return transaction.productionBatch.recipe.name;
  }

  if (transaction.type === "ADJUSTMENT") {
    return transaction.reason || "Manual adjustment";
  }

  if (
    transaction.type === "TRANSFER_IN" ||
    transaction.type === "TRANSFER_OUT"
  ) {
    if (!transaction.inventoryTransfer) {
      return "Inventory transfer";
    }

    return `${formatLocation(
      transaction.inventoryTransfer.sourceLocation
    )} → ${formatLocation(
      transaction.inventoryTransfer.destinationLocation
    )}`;
  }

  return transaction.reason || "—";
};

function InventoryHistoryDialog({
  open,
  ingredient,
  onClose,
}: InventoryHistoryDialogProps) {

  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !ingredient) {
      return;
    }

    const fetchHistory = async () => {
      setTransactions([]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch(
          `/api/raw-ingredients/${ingredient.id}/transactions`
        );

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(
            errorData.error || "Failed to load inventory history."
          );
        }

        const data = await response.json();

        setTransactions(data.transactions);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load inventory history.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [open, ingredient]);

  const formatChange = (
    change: number,
    unit: MeasurementUnit
  ) => {
    const formattedChange =
      change > 0
        ? `+${change.toFixed(2)}`
        : change.toFixed(2);

    return `${formattedChange} ${formatUnit(unit)}`;
  };

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
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        Inventory History
        {ingredient && ` — ${ingredient.name}`}

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
      </DialogTitle>

      <DialogContent>
        {ingredient && (
          <Stack direction="row" sx={{ justifyContent:'space-between', alignItems:'center'}}>          <Box
            sx={{
                mb: 3,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
          >
            <Typography sx={{ mb: 2 }}>
              <strong>Current inventory: </strong>
              {ingredient.currentQuantity.toFixed(2)}{" "}
              {formatUnit(ingredient.canonicalUnit)}
            </Typography>
          </Box>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <CircularProgress />
        ) : transactions.length === 0 ? (
          <Typography>No inventory history found.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>Date</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>Type</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>Change</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>Previous</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>New</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>Source / Reason</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>
                      {new Date(
                        transaction.createdAt
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{transaction.type}</TableCell>

                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>
                      {ingredient &&
                        formatChange(
                          transaction.quantityChange,
                          ingredient.canonicalUnit
                        )}
                    </TableCell>

                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>
                      {transaction.previousQuantity.toFixed(2)}{" "}
                      {ingredient && formatUnit(ingredient.canonicalUnit)}
                    </TableCell>

                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>
                      {transaction.newQuantity.toFixed(2)}{" "}
                      {ingredient && formatUnit(ingredient.canonicalUnit)}
                    </TableCell>

                    <TableCell align="center">
                      {getSourceOrReason(transaction)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default InventoryHistoryDialog;