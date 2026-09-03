import { useEffect, useState, useCallback } from "react";
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
  TablePagination,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import PurchaseDetailsDialog from "../components/PurchaseDetailsDialog";
import type { RawIngredient } from "../types/rawIngredient";
import type { SupplyItem } from "../types/supplyItem";
import CreatePurchaseDialog from "../components/CreatePurchaseDialog";
import apiFetch from "../api/apiFetch";
import EditPurchaseDialog from "../components/EditPurchaseDialog";
import { useTranslation } from "react-i18next";
import useAuth from "../context/useAuth";

function PurchasesPage() {
  const { t } = useTranslation();
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
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([]);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState({
    purchaseCount: 0,
    subtotal: 0,
    taxAmount: 0,
    totalPrice: 0,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [supplierFilter, setSupplierFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const { user } = useAuth();

  const canCreatePurchase = user?.permissions.includes("purchases.create") ?? false;
  const canViewCost = user?.permissions.includes("purchases.view_cost") ?? false;

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

    const purchaseSupplyItems = createdPurchase.items
      .map((item) => item.supplyItem)
      .filter(
        (supplyItem): supplyItem is SupplyItem =>
          supplyItem !== null &&
          supplyItem !== undefined
      );

    setSupplyItems((previousSupplyItems) => {
      const supplyItemMap = new Map(
        previousSupplyItems.map((supplyItem) => [
          supplyItem.id,
          supplyItem,
        ])
      );

      for (const supplyItem of purchaseSupplyItems) {
        supplyItemMap.set(supplyItem.id, supplyItem);
      }

      if (page === 0) {
        fetchPurchasesData();
      } else {
        setPage(0);
      }
      return Array.from(supplyItemMap.values());
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
  
    const purchaseIngredients = updatedPurchase.items
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
  
    const purchaseSupplyItems = updatedPurchase.items
      .map((item) => item.supplyItem)
      .filter(
        (supplyItem): supplyItem is SupplyItem =>
          supplyItem !== null &&
          supplyItem !== undefined
      );
    
    setSupplyItems((previousSupplyItems) => {
      const supplyItemMap = new Map(
        previousSupplyItems.map((supplyItem) => [
          supplyItem.id,
          supplyItem,
        ])
      );
    
      for (const supplyItem of purchaseSupplyItems) {
        supplyItemMap.set(supplyItem.id, supplyItem);
      }
    
      return Array.from(supplyItemMap.values());
    });
  
    setSelectedPurchase(updatedPurchase);
    setEditDialogOpen(false);
    setEditPurchase(null);
    fetchPurchasesData();
  };

  const handlePageChange = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    setPage(0);

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }

    const now = new Date();

    if (preset === "thisMonth") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(end.toISOString().slice(0, 10));
      return;
    }

    if (preset === "lastMonth") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);

      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(end.toISOString().slice(0, 10));
    }
  };

  const fetchPurchasesData = useCallback(async () => {
    setIsPurchaseLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        pageSize: String(rowsPerPage),
      });

      if (supplierFilter) {
        params.set("supplierId", supplierFilter);
      }

      if (startDate) {
        params.set("startDate", startDate);
      }

      if (endDate) {
        params.set("endDate", endDate);
      }

      const response = await apiFetch(
        `/api/purchases?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(t("common.errors.networkError"));
      }

      const data = await response.json();

      setPurchases(data.purchases);
      setTotalPurchases(data.pagination.total);
      setPurchaseSummary(data.summary);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t("purchases.errors.loadFailed"));
      }
    } finally {
      setIsPurchaseLoading(false);
    }
}, [
  page,
  rowsPerPage,
  supplierFilter,
  startDate,
  endDate,
  t,
]);

  useEffect(() => {
    fetchPurchasesData();
  }, [fetchPurchasesData]);

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

  useEffect(() => {
    const fetchSupplyItems = async () => {
      try {
        const response = await apiFetch("/api/supply-items");

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(
            errorData.error ||
            errorData.message ||
            t("supplyItems.errors.loadFailed")
          );
        }

        const data = await response.json();
        setSupplyItems(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    };

    fetchSupplyItems();
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
          
          {canCreatePurchase && (
            <Button
              variant="contained"
              onClick={handleCreatePurchaseClick}
            >
              {t("purchases.createPurchase")}
            </Button>
          )}
        </Box>
        {canViewCost && (
          <Paper
            sx={{
              p: 2,
              width: 300,
              borderRadius: 3,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              {t("purchases.summary.title")}
            </Typography>
            
            <Stack spacing={1}>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between" }}
              >
                <Typography>
                  {t("purchases.summary.purchases")}
                </Typography>
            
                <Typography>
                  {purchaseSummary.purchaseCount}
                </Typography>
              </Stack>
            
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between" }}
              >
                <Typography>
                  {t("purchases.summary.subtotal")}
                </Typography>
            
                <Typography>
                  ₡{purchaseSummary.subtotal.toFixed(2)}
                </Typography>
              </Stack>
            
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between" }}
              >
                <Typography>
                  {t("purchases.summary.tax")}
                </Typography>
            
                <Typography>
                  ₡{purchaseSummary.taxAmount.toFixed(2)}
                </Typography>
              </Stack>
            
              <Divider />
            
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between" }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {t("purchases.summary.total")}
                </Typography>
            
                <Typography sx={{ fontWeight: 700 }}>
                  ₡{purchaseSummary.totalPrice.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          </Paper> 
        )}
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>{t("purchases.filters.supplier")}</InputLabel>
            
          <Select
            value={supplierFilter}
            label="Supplier"
            onChange={(event) => {
              setSupplierFilter(event.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">
               {t("purchases.filters.allSuppliers")}
            </MenuItem>
          
            {suppliers.map((supplier) => (
              <MenuItem
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
          
        <TextField
          label={t("purchases.filters.startDate")}
          type="date"
          value={startDate}
          onChange={(event) => {
            setStartDate(event.target.value);
            setDatePreset("custom");
            setPage(0);
          }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
      
        <TextField
          label={t("purchases.filters.endDate")}
          type="date"
          value={endDate}
          onChange={(event) => {
            setEndDate(event.target.value);
            setDatePreset("custom");
            setPage(0);
          }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>{t("purchases.filters.dateRange")}</InputLabel>

          <Select
            value={datePreset}
            label="Date range"
            onChange={(event) => applyDatePreset(event.target.value)}
          >
            <MenuItem value="all">{t("purchases.filters.allTime")}</MenuItem>
            <MenuItem value="thisMonth">{t("purchases.filters.thisMonth")}</MenuItem>
            <MenuItem value="lastMonth">{t("purchases.filters.lastMonth")}</MenuItem>
            <MenuItem value="custom" disabled>{t("purchases.filters.customRange")}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {isPurchaseLoading ? (
        <Typography>{t("purchases.loading")}</Typography>
      ) : purchases.length === 0 ? (
        <Typography>{t("purchases.empty")}</Typography>
      ) : (
        <>
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
                  {canViewCost && (
                    <>
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
                    </>
                  )}
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
                    {canViewCost && (
                      <>
                        <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>{`₡${p.subtotal?.toFixed(2)}`}</TableCell>
                        <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>{`₡${p.taxAmount?.toFixed(2)}`}</TableCell>
                        <TableCell align="center">{`₡${p.totalPrice?.toFixed(2)}`}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalPurchases}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage={t("purchases.pagination.rowsPerPage")}
          />
        </>
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
          supplyItems={supplyItems}
        />
      )}

      {editPurchase && (
        <EditPurchaseDialog
          open={editDialogOpen}
          purchase={editPurchase}
          suppliers={suppliers}
          rawIngredients={rawIngredients}
          supplyItems={supplyItems}
          onClose={handleEditPurchaseClose}
          onPurchaseUpdated={handlePurchaseUpdated}
        />
      )}
    </Box>
  );
}

export default PurchasesPage;
