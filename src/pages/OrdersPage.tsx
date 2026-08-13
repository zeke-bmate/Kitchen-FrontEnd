import { useState, useEffect } from "react";
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
  Chip,
} from "@mui/material";
import apiFetch from "../api/apiFetch";
import type { Order, OrderDetails, OrderLocation, OrderStatus } from "../types/orders";
import type { Recipe } from "../types/recipe";
import OrderDetailsDialog from "../components/OrderDetailsDialog";

const formatLocation = (location: OrderDetails["location"]) => {
  switch (location) {
    case "DEE_PLACE":
      return "DeePlace";
    case "ECHO_POKER":
      return "Echo Poker";
    case "ECHO_EVENTS":
      return "Echo Events";
    default:
      return "--";
  }
};

function OrdersPage() {
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isRecipeLoading, setIsRecipeLoading] = useState(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [quantity, setQuantity] = useState<string | null>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<OrderLocation | "">("");
  const [locationError, setLocationError] = useState<string | null>(null);

  const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
      CREATED: "PENDING",
      PENDING: "DONE",
      DONE: "DELIVERY",
      DELIVERY: "FINISHED",
  };

  const statusChipColor: Record<
    OrderStatus,
    "default" | "primary" | "warning" | "success" | "secondary"
  > = {
    CREATED: "default",
    PENDING: "warning",
    DONE: "success",
    DELIVERY: "primary",
    FINISHED: "secondary",
  };

  const handleRecipeChange = (event) => {
    setRecipeError(null);
    setSelectedRecipeId(event.target.value);
  };

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocationError(null);
    setSelectedLocation(event.target.value);
  };

  const handleOpenOrder = async (orderId: string) => {
    try {
      const response = await apiFetch(`/api/orders/${orderId}`);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load order details.");
      }
  
      const orderDetails: OrderDetails = await response.json();
  
      setSelectedOrder(orderDetails);
      setDetailsOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load order details.");
      }
    }
};
  
  const handleCloseOrder = () => {
      setDetailsOpen(false);
      setSelectedOrder(null);
  };

  const selectedRecipe = recipes.find(
    (recipe) => recipe.id === selectedRecipeId,
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedRecipeId = selectedRecipeId.trim();
    const quantityNum = Number(quantity);
    setRecipeError(null);
    setQuantityError(null);
    setFormError(null);
    setLocationError(null);
    if (!trimmedRecipeId) {
      setRecipeError("Recipe ID must be a non empty string.");
      return;
    }
    if (Number.isNaN(quantityNum) || quantityNum <= 0) {
      setQuantityError(
        "Servings ordered must be a positive number greater than zero.",
      );
      return;
    }
    if (!selectedLocation) {
      setLocationError("Location is required.");
      return;
    }
    setSubmitting(true);
    const data = {
      recipeId: trimmedRecipeId,
      quantity: quantityNum,
      location: selectedLocation,
    };
    try {
      const response = await apiFetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }
      const createdOrder = await response.json();

      setOrders((previousOrders) => [
        createdOrder,
        ...previousOrders,
      ]);
      setSelectedRecipeId("");
      setQuantity("");
      setSelectedLocation("");
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to create order.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStatus = async (
    orderId: string,
    nextStatus: string,
  ) => {
    try {
        const response = await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            status: nextStatus,
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order status.");
    }

    const updatedOrder = await response.json();

    setOrders(previousOrders =>
        previousOrders.map(order =>
            order.id === updatedOrder.id ? updatedOrder : order
            )
        );
    } catch (error) {
        if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to update order status.");
      }
    }
  }

  useEffect(() => {
    const fetchRecipesData = async () => {
      try {
        const response = await apiFetch("/api/recipes");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load Recipe Data");
        }
      } finally {
        setIsRecipeLoading(false);
      }
    };

    fetchRecipesData();
  }, []);

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const response = await apiFetch("/api/orders");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load Order Data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdersData();
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ padding: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Orders
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Track orders from Dee Place, Echo Poker, and Echo Events.
      </Typography>
      <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
              <FormControl error={!!recipeError} sx={{ minWidth: 200 }}>
                <InputLabel id="recipe-select-label">Recipe</InputLabel>
                <Select
                  value={selectedRecipeId}
                  onChange={handleRecipeChange}
                  label="Recipe"
                  labelId="recipe-select-label"
                  autoWidth
                >
                  {recipes.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
                {!!recipeError && <FormHelperText>{recipeError}</FormHelperText>}
              </FormControl>
              <TextField
                type="number"
                error={!!quantityError}
                label="Servings"
                value={quantity}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">servings</InputAdornment>
                    ),
                  },
                }}
                onChange={handleQuantityChange}
                helperText={
                  quantityError
                    ? quantityError
                    : selectedRecipe
                      ? `Order servings. This recipe yields ${selectedRecipe.servings} servings per batch.`
                      : "Select a recipe to view its servings per batch."
                }
              />
              <FormControl error={!!locationError} sx={{ minWidth: 180 }}>
                <InputLabel id="location-select-label">Location</InputLabel>

                <Select
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  label="Location"
                  labelId="location-select-label"
                >
                  <MenuItem value="DEE_PLACE">DeePlace</MenuItem>
                  <MenuItem value="ECHO_POKER">Echo Poker</MenuItem>
                  <MenuItem value="ECHO_EVENTS">Echo Events</MenuItem>
                </Select>

                {!!locationError && (
                  <FormHelperText>{locationError}</FormHelperText>
                )}
              </FormControl>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? "Adding..." : "Submit"}
              </Button>
            </Stack>
        </form>
      {formError && <Alert severity="error">{formError}</Alert>}
      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : orders.length === 0 ? (
        <Typography>No orders found.</Typography>
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
                  Recipe
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
                  Quantity
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
                  Location
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
                  Status
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
                  Created At
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
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => {

                const nextStatus = nextStatusMap[o.status];
                return (
                <TableRow key={o.id} hover sx={{ cursor: "pointer" }} onClick={() => handleOpenOrder(o.id)}>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {o.recipe?.name ?? "No recipe"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {o.quantity}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {formatLocation(o.location)}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    <Chip
                      label={o.status}
                      color={statusChipColor[o.status]}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {new Date(o.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      disabled={!nextStatus}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleNextStatus(o.id, nextStatus);
                        }}
                      >
                      {nextStatus ? `Move to ${nextStatus}` : "Finished"}
                    </Button>
                  </TableCell>
                </TableRow>
                );
            })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <OrderDetailsDialog
          open={detailsOpen}
          selectedOrder={selectedOrder}
          onClose={handleCloseOrder}
      />
    </Box>
  );
}

export default OrdersPage;
