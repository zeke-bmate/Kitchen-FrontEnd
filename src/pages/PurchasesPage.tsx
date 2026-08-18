import { useEffect, useState } from "react";
import type { Purchase } from "../types/purchase";
import type { Supplier } from "../types/supplier";
import type { PurchaseItemInput } from "../types/purchaseItemInput";
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
} from "@mui/material";
import PurchaseDetailsDialog from "../components/PurchaseDetailsDialog";
import type { RawIngredient } from "../types/rawIngredient";
import CreatePurchaseDialog from "../components/CreatePurchaseDialog";
import apiFetch from "../api/apiFetch";
import EditPurchaseDialog from "../components/EditPurchaseDialog";
import { useTranslation } from "react-i18next";

function PurchasesPage() {
  const { t } = useTranslation();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<PurchaseItemInput[]>([]);
  const [date, setDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(true);
  const [isSupplierLoading, setIsSupplierLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rawIngredients, setRawIngredients] = useState<RawIngredient[]>([]);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handlePurchaseClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setDialogOpen(true);
  };

  const handlePurchaseClose = () => {
    setDialogOpen(false);
    setSelectedPurchase(null);
  };

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
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPurchases(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load Purchase Data");
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
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setSuppliers(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load supplier Data");
        }
      } finally {
        setIsSupplierLoading(false);
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
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {t("purchases.title")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {t("purchases.subtitle")}
      </Typography>
      <Button
        variant="contained"
        onClick={handleCreatePurchaseClick}
        sx={{ mb: 3 }}
      >
        {t("purchases.createPurchase")}
      </Button>
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
