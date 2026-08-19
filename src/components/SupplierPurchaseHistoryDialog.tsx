import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo, useState } from "react";
import type { Supplier } from "../types/supplier";
import type { Purchase } from "../types/purchase";
import apiFetch from "../api/apiFetch";
import { useTranslation } from "react-i18next";

type SupplierPurchaseHistoryDialogProps = {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onPurchaseClick: (purchase: Purchase) => void;
};

type PurchaseGroup = {
  key: string;
  label: string;
  purchases: Purchase[];
};

function SupplierPurchaseHistoryDialog({
  open,
  supplier,
  onClose,
  onPurchaseClick,
}: SupplierPurchaseHistoryDialogProps) {
  const { t, i18n } = useTranslation();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !supplier) {
      return;
    }

    const fetchPurchaseHistory = async () => {
      setIsLoading(true);
      setError(null);
      setPurchases([]);

      try {
        const response = await apiFetch(
          `/api/suppliers/${supplier.id}/purchases`
        );

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(
            errorData.error ||
              t("suppliers.history.loadFailed")
          );
        }

        const data = await response.json();

        setPurchases(data.purchases);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(t("suppliers.history.loadFailed"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [open, supplier]);

  const groupedPurchases = useMemo(() => {
    const groups = new Map<string, PurchaseGroup>();

    for (const purchase of purchases) {
      const date = new Date(purchase.date);

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: date.toLocaleDateString(i18n.language, {
            month: "long",
            year: "numeric",
          }),
          purchases: [],
        });
      }

      groups.get(key)!.purchases.push(purchase);
    }

    return Array.from(groups.values());
  }, [purchases, i18n.language]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        {t("suppliers.history.title")}
        {supplier && ` — ${supplier.name}`}
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
        ) : purchases.length === 0 ? (
          <Typography>{t("suppliers.history.empty")}</Typography>
        ) : (
          groupedPurchases.map((group) => {
            const monthSubtotal = group.purchases.reduce(
              (sum, purchase) => sum + purchase.subtotal,
              0
            );

            const monthTax = group.purchases.reduce(
              (sum, purchase) => sum + purchase.taxAmount,
              0
            );

            const monthTotal = group.purchases.reduce(
              (sum, purchase) => sum + purchase.totalPrice,
              0
            );

            return (
              <Box key={group.key} sx={{ mb: 4 }}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    {group.label}
                  </Typography>

                  <Stack spacing={0.5} sx={{ textAlign: "right" }}>
                    <Typography>
                      {t("suppliers.history.monthlySubtotal")}:{" "}
                      ₡{monthSubtotal.toFixed(2)}
                    </Typography>

                    <Typography>
                      {t("suppliers.history.monthlyTax")}:{" "}
                      ₡{monthTax.toFixed(2)}
                    </Typography>

                    <Typography sx={{ fontWeight: 700 }}>
                      {t("suppliers.history.monthlyTotal")}:{" "}
                      ₡{monthTotal.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 2 }} />

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
                            borderBottom: "1px solid #e0e0e0",
                          }}
                        >
                          {t("suppliers.history.date")}
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
                          {t("suppliers.history.items")}
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
                          {t("suppliers.history.subtotal")}
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
                          {t("suppliers.history.tax")}
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
                          {t("suppliers.history.total")}
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {group.purchases.map((purchase) => (
                        <TableRow
                          key={purchase.id}
                          hover
                          onClick={() =>
                            onPurchaseClick(purchase)
                          }
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell
                            align="center"
                            sx={{ borderRight: "1px solid #e0e0e0" }}
                          >
                            {new Date(
                              purchase.date
                            ).toLocaleDateString()}
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={{ borderRight: "1px solid #e0e0e0" }}
                          >
                            {purchase.items.length}
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={{ borderRight: "1px solid #e0e0e0" }}
                          >
                            ₡{purchase.subtotal.toFixed(2)}
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={{ borderRight: "1px solid #e0e0e0" }}
                          >
                            ₡{purchase.taxAmount.toFixed(2)}
                          </TableCell>

                          <TableCell align="center">
                            ₡{purchase.totalPrice.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          })
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SupplierPurchaseHistoryDialog;