import { useEffect, useMemo, useState } from "react";
import type { Purchase } from "../types/purchase";
import type { Supplier } from "../types/supplier";
import {
  Box,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import PurchaseDetailsDialog from "../components/PurchaseDetailsDialog";
import type { RawIngredient } from "../types/rawIngredient";
import CreatePurchaseDialog from "../components/CreatePurchaseDialog";
import apiFetch from "../api/apiFetch";
import EditPurchaseDialog from "../components/EditPurchaseDialog";
import { useTranslation } from "react-i18next";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function PurchasesPage() {
  const { t, i18n } = useTranslation();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rawIngredients, setRawIngredients] = useState<RawIngredient[]>([]);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [summaryMonthIndex, setSummaryMonthIndex] = useState(0);

  const handlePurchaseClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setDialogOpen(true);
  };

  const handlePurchaseClose = () => {
    setDialogOpen(false);
    setSelectedPurchase(null);
  };
  
  const monthlyGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        label: string;
        purchases: Purchase[];
      }
    >();

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

    return Array.from(groups.values()).sort(
      (a, b) => b.key.localeCompare(a.key)
    );
  }, [purchases, i18n.language]);

  const selectedMonth = monthlyGroups[summaryMonthIndex] ?? null;

  const monthlySubtotal =
    selectedMonth?.purchases.reduce(
      (sum, purchase) => sum + purchase.subtotal,
      0
    ) ?? 0;
  
  const monthlyTax =
    selectedMonth?.purchases.reduce(
      (sum, purchase) => sum + purchase.taxAmount,
      0
    ) ?? 0;
  
  const monthlyTotal =
    selectedMonth?.purchases.reduce(
      (sum, purchase) => sum + purchase.totalPrice,
      0
    ) ?? 0;

  const handlePurchaseCreated = (
    createdPurchase: Purchase
  ) => {
    setPurchases((previousPurchases) => [
      createdPurchase,
      ...previousPurchases,
    ]);
  
    const purchaseIngredients = createdPurchase.items
      .map((item) => item.rawIngredient)
      .filter(
        (ingredient): ingredient is RawIngredient =>
          ingredient !== null &&
          ingredient !== undefined
      );
  
    setRawIngredients((previousIngredients) => {
      const ingredientMap = new Map(
        previousIngredients.map((ingredient) => [
          ingredient.id,
          ingredient,
        ])
      );
  
      for (const ingredient of purchaseIngredients) {
        ingredientMap.set(ingredient.id, ingredient);
      }
  
      return Array.from(ingredientMap.values());
    });
  };

  const handleCreatePurchaseClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCreatePurchaseClose = () => {
    setCreateDialogOpen(false);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setDialogOpen(false);
    setEditPurchase(purchase);
    setEditDialogOpen(true);
  };
  
  const handleEditPurchaseClose = () => {
    setEditDialogOpen(false);
    setEditPurchase(null);
  };
  
  const handlePurchaseUpdated = (
    updatedPurchase: Purchase
  ) => {
    setPurchases((previousPurchases) =>
      previousPurchases.map((purchase) =>
        purchase.id === updatedPurchase.id
          ? updatedPurchase
          : purchase
      )
    );
  
    setSelectedPurchase(updatedPurchase);
    setEditDialogOpen(false);
    setEditPurchase(null);
  };

  useEffect(() => {
    const fetchPurchasesData = async () => {
      try {
        const response = await apiFetch("/api/purchases");
        if (!response.ok) {
          throw new Error(t("common.errors.networkError"));
        }
        const data = await response.json();
        setPurchases(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(t("purchases.errors.loadFailed"));
        }
      } finally {
        setIsPurchaseLoading(false);
      }
    };

    fetchPurchasesData();
  }, []);

  useEffect(() => {
    const fetchSuppliersData = async () => {
      try {
        const response = await apiFetch("/api/suppliers");
        if (!response.ok) {
          throw new Error(t("common.errors.networkError"));
        }
        const data = await response.json();
        setSuppliers(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(t("suppliers.errors.loadFailed"));
        }
      }
    };

    fetchSuppliersData();
  }, []);

  useEffect(() => {
    const fetchRawIngredients = async () => {
      try {
        const response = await apiFetch("/api/raw-ingredients");

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(
            errorData.error ||
            errorData.message ||
            "Failed to fetch raw ingredients."
          );
        }

        const data = await response.json();
        setRawIngredients(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    };

    fetchRawIngredients();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <Box sx={{ padding: 4, maxWidth: 1000, mx: "auto" }}>
      <Stack
        direction="row"
        spacing={4}
        sx={{
          mb: 3,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            {t("purchases.title")}
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              mb: 3,
            }}
          >
            {t("purchases.subtitle")}
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleCreatePurchaseClick}
          >
            {t("purchases.createPurchase")}
          </Button>
        </Box>
          
        {selectedMonth && (
          <Paper
            sx={{
              p: 2,
              width: 300,
              borderRadius: 3,
            }}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <IconButton
                disabled={
                  summaryMonthIndex >= monthlyGroups.length - 1
                }
                onClick={() =>
                  setSummaryMonthIndex((index) => index + 1)
                }
              >
                <ChevronLeftIcon />
              </IconButton>
              
              <Typography sx={{ fontWeight: 700 }}>
                {selectedMonth.label}
              </Typography>
              
              <IconButton
                disabled={summaryMonthIndex === 0}
                onClick={() =>
                  setSummaryMonthIndex((index) => index - 1)
                }
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>
              
            <Stack spacing={1}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                }}
              >
                <Typography>{t("purchases.summary.purchases")}</Typography>
              
                <Typography>
                  {selectedMonth.purchases.length}
                </Typography>
              </Stack>
              
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                }}
              >
                <Typography>{t("purchases.summary.subtotal")}</Typography>
              
                <Typography>
                  ₡{monthlySubtotal.toFixed(2)}
                </Typography>
              </Stack>
              
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                }}
              >
                <Typography>{t("purchases.summary.tax")}</Typography>
              
                <Typography>
                  ₡{monthlyTax.toFixed(2)}
                </Typography>
              </Stack>
              
              <Divider />
              
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {t("purchases.summary.total")}
                </Typography>
              
                <Typography sx={{ fontWeight: 700 }}>
                  ₡{monthlyTotal.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        )}
      </Stack>

      {isPurchaseLoading ? (
        <Typography>{t("purchases.loading")}</Typography>
      ) : purchases.length === 0 ? (
        <Typography>{t("purchases.empty")}</Typography>
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
                  {t("purchases.table.date")}
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
                  {t("purchases.table.supplier")}
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
                  {t("purchases.table.itemsCount")}
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
                  {t("purchases.table.subtotal")}
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
                  {t("purchases.table.tax")}
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
                  {t("purchases.table.totalPrice")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchases.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  onClick={() => handlePurchaseClick(p)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {new Date(p.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {p.supplier.name}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {p.items.length}
                  </TableCell>
                  <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>{`₡${p.subtotal.toFixed(2)}`}</TableCell>
                  <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>{`₡${p.taxAmount.toFixed(2)}`}</TableCell>
                  <TableCell align="center">{`₡${p.totalPrice.toFixed(2)}`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedPurchase && (
        <PurchaseDetailsDialog
          selectedPurchase={selectedPurchase}
          open={dialogOpen}
          onClose={handlePurchaseClose}
          onEdit={handleEditPurchase}
        />
      )}
      {createDialogOpen && (
        <CreatePurchaseDialog
          open={createDialogOpen}
          onClose={handleCreatePurchaseClose}
          onPurchaseCreated={handlePurchaseCreated}
          suppliers={suppliers}
          rawIngredients={rawIngredients}
        />
      )}

      {editPurchase && (
        <EditPurchaseDialog
          open={editDialogOpen}
          purchase={editPurchase}
          suppliers={suppliers}
          rawIngredients={rawIngredients}
          onClose={handleEditPurchaseClose}
          onPurchaseUpdated={handlePurchaseUpdated}
        />
      )}
    </Box>
  );
}

export default PurchasesPage;
