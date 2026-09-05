import { useState, useEffect } from "react";
import type { Recipe } from "../types/recipe";
import type { ProductionBatch } from "../types/productionBatch";
import Box from "@mui/material/Box";
import {
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Button,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import apiFetch from "../api/apiFetch";
import type { Order } from "../types/orders";
import useAuth from "../context/useAuth";
import { useTranslation } from "react-i18next";

function ProductionBatchesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>(
    [],
  );

  const [isProductionLoading, setIsProductionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [quantityProduced, setQuantityProduced] = useState<string | null>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const { user } = useAuth();
  const { t } = useTranslation();

  const canCreateProduction = user?.permissions.includes("production.create") ?? false;

  const handleOrderChange = (event) => {
    const orderId = event.target.value;
    setSelectedOrderId(orderId);

    if (!orderId) {
        setSelectedRecipeId("");
        setRecipeError(null);
        return;
    }
    
    const selectedOrder = orders.find(
      (order) => order.id === orderId,
    );

    if (selectedOrder) {
      setSelectedRecipeId(selectedOrder.recipeId);
      setRecipeError(null);
    }
  }

  const handleRecipeChange = (event) => {
    setRecipeError(null);
    setSelectedRecipeId(event.target.value);
  };

  const handleQuantityChange = (event) => {
    setQuantityProduced(event.target.value);
  };

  const selectedRecipe = recipes.find(
    (recipe) => recipe.id === selectedRecipeId,
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedRecipeId = selectedRecipeId.trim();
    const quantityProducedNum = Number(quantityProduced);
    setRecipeError(null);
    setQuantityError(null);
    setFormError(null);
    if (!trimmedRecipeId) {
      setRecipeError(t("production.errors.recipeRequired"));
      return;
    }
    if (Number.isNaN(quantityProducedNum) || quantityProducedNum <= 0) {
      setQuantityError(
        t("production.errors.quantityInvalid")
      );
      return;
    }
    setSubmitting(true);
    const data = {
      recipeId: trimmedRecipeId,
      quantityProduced: quantityProducedNum,
      ...(selectedOrderId && { orderId: selectedOrderId }),
    };
    try {
      const response = await apiFetch("/api/production-batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("production.errors.createFailed"));
      }
      const createdProductionBatch = await response.json();

      setProductionBatches((previousProductionBatches) => [
        createdProductionBatch,
        ...previousProductionBatches,
      ]);
      setSelectedRecipeId("");
      setQuantityProduced("");
      setSelectedOrderId("");
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(t("production.errors.createFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProductionData = async () => {
      try {
        const productionResponse = await apiFetch(
          "/api/production-batches"
        );

        if (!productionResponse.ok) {
          throw new Error(t("production.errors.loadFailed"));
        }

        const productionData = await productionResponse.json();
        setProductionBatches(productionData);

        if (canCreateProduction) {
          const [recipesResponse, ordersResponse] = await Promise.all([
            apiFetch("/api/recipes"),
            apiFetch("/api/orders"),
          ]);

          if (!recipesResponse.ok || !ordersResponse.ok) {
            throw new Error(t("production.errors.loadFailed"));
          }

          const [recipesData, ordersData] = await Promise.all([
            recipesResponse.json(),
            ordersResponse.json(),
          ]);

          setRecipes(recipesData);
          setOrders(ordersData);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setIsProductionLoading(false);
      }
    };

    fetchProductionData();
  }, [canCreateProduction, t]);

  if (error) return <p>{error}</p>;

  return (
    <Box sx={{ padding: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
         {t("production.title")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {t("production.subtitle")}
      </Typography>
      {canCreateProduction && (
        <>
          <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="order-select-label">{t("production.form.order")}</InputLabel>
                <Select
                  value={selectedOrderId}
                  onChange={handleOrderChange}
                  label={t("production.form.order")}
                  labelId="order-select-label"
                  autoWidth
                >
                  <MenuItem value="">
                    <em>{t("production.form.manualProduction")}</em>
                  </MenuItem>
                  {orders.map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {t("production.form.orderOption", {
                        recipe: o.recipe.name,
                        quantity: o.quantity,
                        status: t(`orderStatuses.${o.status}`),
                      })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl error={!!recipeError} sx={{ minWidth: 200 }}>
                <InputLabel id="recipe-select-label">{t("production.form.recipe")}</InputLabel>
                <Select
                  value={selectedRecipeId}
                  onChange={handleRecipeChange}
                  label={t("production.form.recipe")}
                  labelId="recipe-select-label"
                  autoWidth
                  disabled={!!selectedOrderId}
                >
                  {recipes.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
                {!!recipeError && <FormHelperText>{recipeError}</FormHelperText>}
                <FormHelperText>
                  {selectedOrderId
                    ? t("production.form.recipeFromOrder")
                    : t("production.form.selectRecipe")}
                </FormHelperText>
              </FormControl>
              <TextField
                type="number"
                error={!!quantityError}
                label={t("production.form.batchesProduced")}
                value={quantityProduced}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">{t("production.form.batches")}</InputAdornment>
                    ),
                  },
                }}
                onChange={handleQuantityChange}
                helperText={
                  quantityError
                    ? quantityError
                    : selectedRecipe
                      ? t("production.form.servingsPerBatch", {
                          servings: selectedRecipe.servings,
                        })
                      : t("production.form.selectRecipeForServings")
                }
              />
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting
                  ? t("production.form.adding")
                  : t("production.form.submit")}
              </Button>
            </Stack>
          </form>
          {formError && <Alert severity="error">{formError}</Alert>}
        </>
      )}
      {isProductionLoading ? (
        <Typography>{t("production.loading")}</Typography>
      ) : productionBatches.length === 0 ? (
        <Typography>{t("production.empty")}</Typography>
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
                  {t("production.table.recipe")}
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
                  {t("production.table.order")}
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
                  {t("production.table.batchesProduced")}
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
                  {t("production.table.createdAt")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productionBatches.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {p.recipe.name}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {p.order
                      ? t("production.table.orderDetails", {
                          quantity: p.order.quantity,
                          status: t(`orderStatuses.${p.order.status}`),
                        })
                      : t("production.form.manualProduction")}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {p.quantityProduced}
                  </TableCell>
                  <TableCell align="center">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default ProductionBatchesPage;
