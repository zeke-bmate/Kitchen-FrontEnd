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
import { useTranslation } from "react-i18next";
import type { RawIngredient } from "../types/rawIngredient";
import type { InventoryTransaction } from "../types/inventoryTransaction";
import apiFetch from "../api/apiFetch";
import CloseIcon from '@mui/icons-material/Close';
import type { MeasurementUnit } from "../types/measurementUnit";

type InventoryHistoryDialogProps = {
  open: boolean;
  ingredient: RawIngredient | null;
  onClose: () => void;
};

function InventoryHistoryDialog({
  open,
  ingredient,
  onClose,
}: InventoryHistoryDialogProps) {

  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const getSourceOrReason = (
    transaction: InventoryTransaction
  ) => {
    if (transaction.type === "PURCHASE") {
      if (!transaction.purchase) {
        return t("ingredients.history.sources.purchase");
      }

      return `${transaction.purchase.supplier.name} — ${new Date(
        transaction.purchase.date
      ).toLocaleDateString()}`;
    }

    if (transaction.type === "PRODUCTION") {
      if (!transaction.productionBatch) {
        return t("ingredients.history.sources.production");
      }

      return transaction.productionBatch.recipe.name;
    }

    if (transaction.type === "ADJUSTMENT") {
      return (
        transaction.reason ||
        t("ingredients.history.sources.manualAdjustment")
      );
    }

    if (
      transaction.type === "TRANSFER_IN" ||
      transaction.type === "TRANSFER_OUT"
    ) {
      if (!transaction.inventoryTransfer) {
        return t("ingredients.history.sources.inventoryTransfer");
      }

      const source = t(
        `locations.${transaction.inventoryTransfer.sourceLocation}`,
        {
          defaultValue:
            transaction.inventoryTransfer.sourceLocation,
        }
      );

      const destination = t(
        `locations.${transaction.inventoryTransfer.destinationLocation}`,
        {
          defaultValue:
            transaction.inventoryTransfer.destinationLocation,
        }
      );

      return `${source} → ${destination}`;
    }

    return transaction.reason || "—";
  };

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
            errorData.error || t("ingredients.history.errors.loadFailed")
          );
        }

        const data = await response.json();

        setTransactions(data.transactions);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(t("ingredients.history.errors.loadFailed"));
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

    return `${formattedChange} ${t(`units.${unit}`)}`;
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
        {t("ingredients.history.title")}
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
              <strong>
                {t("ingredients.history.currentInventory")}:
              </strong>{" "}
              {ingredient.currentQuantity.toFixed(2)}{" "}
              {t(`units.${ingredient.canonicalUnit}`)}
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
          <Typography>{t("ingredients.history.empty")}</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>{t("ingredients.history.table.date")}</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>{t("ingredients.history.table.type")}</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>{t("ingredients.history.table.change")}</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>{t("ingredients.history.table.previous")}</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>{t("ingredients.history.table.new")}</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>{t("ingredients.history.table.sourceReason")}</TableCell>
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

                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{t(`ingredients.history.types.${transaction.type}`, {
                                                                                            defaultValue: transaction.type,
                                                                                          })}
                    </TableCell>

                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>
                      {ingredient &&
                        formatChange(
                          transaction.quantityChange,
                          ingredient.canonicalUnit
                        )}
                    </TableCell>

                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>
                      {transaction.previousQuantity.toFixed(2)}{" "}
                      {ingredient &&
                        t(`units.${ingredient.canonicalUnit}`)}
                    </TableCell>

                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>
                      {transaction.newQuantity.toFixed(2)}{" "}
                      {ingredient &&
                        t(`units.${ingredient.canonicalUnit}`)}
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