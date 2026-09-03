import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import apiFetch from "../api/apiFetch";
import type { RawIngredient } from "../types/rawIngredient";

type InventoryTransfer = {
  id: string;
  sourceLocation: string;
  destinationLocation: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    rawIngredient: RawIngredient;
  }[];
};

type TransferHistoryDialogProps = {
  open: boolean;
  onClose: () => void;
};

function TransferHistoryDialog({
  open,
  onClose,
}: TransferHistoryDialogProps) {

  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchTransfers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch(
          "/api/inventory-transfers"
        );

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(
            errorData.error ||
              t("ingredients.transferHistory.errors.loadFailed")
          );
        }

        const data = await response.json();

        setTransfers(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            t("ingredients.transferHistory.errors.loadFailed")
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransfers();
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        {t("ingredients.transferHistory.title")}
      </DialogTitle>

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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <CircularProgress />
        ) : transfers.length === 0 ? (
          <Typography>
            {t("ingredients.transferHistory.empty")}
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
            }}
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
                    }}
                  >
                    {t("ingredients.transferHistory.table.date")}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      backgroundColor: "primary.main",
                    }}
                  >
                    {t("ingredients.transferHistory.table.direction")}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      backgroundColor: "primary.main",
                    }}
                  >
                    {t("ingredients.transferHistory.table.ingredient")}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      backgroundColor: "primary.main",
                    }}
                  >
                    {t("ingredients.transferHistory.table.quantity")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {transfers.flatMap((transfer) =>
                  transfer.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell align="center">
                        {new Date(
                          transfer.createdAt
                        ).toLocaleString()}
                      </TableCell>

                      <TableCell align="center">
                        {t(`locations.${transfer.sourceLocation}`, {
                          defaultValue: transfer.sourceLocation,
                        })}{" "}
                        →{" "}
                        {t(`locations.${transfer.destinationLocation}`, {
                          defaultValue: transfer.destinationLocation,
                        })}
                      </TableCell>

                      <TableCell align="center">
                        {item.rawIngredient.name}
                      </TableCell>

                      <TableCell align="center">
                        {item.quantity.toFixed(2)}{" "}
                        {t(`units.${item.rawIngredient.canonicalUnit}`)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TransferHistoryDialog;