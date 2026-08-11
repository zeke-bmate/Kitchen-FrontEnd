import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import type { Purchase } from "../types/purchase";
import type { PurchaseItemInput } from "../types/purchaseItemInput";
import type { PurchaseItemError } from "../types/purchaseItemError";
import type { Supplier } from "../types/supplier";
import type { RawIngredient } from "../types/rawIngredient";
import apiFetch from "../api/apiFetch";

type CreatePurchaseDialogProps = {
  open: boolean;
  onClose: () => void;
  onPurchaseCreated: (purchase: Purchase) => void;
  suppliers: Supplier[];
  rawIngredients: RawIngredient[];
};

const getPurchaseDraft = () => {
  const savedDraft = localStorage.getItem("purchaseDraft");

  if (!savedDraft) {
    return null;
  }

  try {
    return JSON.parse(savedDraft);
  } catch {
    localStorage.removeItem("purchaseDraft");
    return null;
  }
};

function CreatePurchaseDialog({
  open,
  onClose,
  onPurchaseCreated,
  suppliers,
  rawIngredients,
}: CreatePurchaseDialogProps) {
  const draft = getPurchaseDraft();
  const [supplierId, setSupplierId] = useState<string>(draft?.supplierId ?? "");
  const [date, setDate] = useState<string>(draft?.date ?? "");
  const [supplierError, setSupplierError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemInput[]>(
    draft?.purchaseItems?.length
      ? draft.purchaseItems
      : [
          {
            orderUnits: "",
            weightKg: "",
            totalPrice: "",
          },
        ]
  );
  const [purchaseItemErrors, setPurchaseItemErrors] = useState<
    PurchaseItemError[]
  >([]);

  const handleAddItemClick = () => {
    setPurchaseItems((previousItems) => [
      ...previousItems,
      {
        orderUnits: "",
        weightKg: "",
        totalPrice: "",
      },
    ]);
  };

  const handleRemoveItemClick = (indexToRemove) => {
    const filteredItems = purchaseItems.filter(
      (_, index) => index !== indexToRemove,
    );
    setPurchaseItems(filteredItems);
  };

  const handleOrderUnitsChange = (index, event) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index].orderUnits = event.target.value;
    setPurchaseItems(updatedItems);
  };

  const handleWeightChange = (index, event) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index].weightKg = event.target.value;
    setPurchaseItems(updatedItems);
  };

  const handleTotalPriceChange = (index, event) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index].totalPrice = event.target.value;
    setPurchaseItems(updatedItems);
  };

  const handleSupplierChange = (event) => {
    setSupplierError(null);
    setSupplierId(event.target.value);
  };

  const handleDateChange = (event) => {
    setDateError(null);
    setDate(event.target.value);
  };

  useEffect(() => {
    const draft = {
      supplierId,
      date,
      purchaseItems,
    };
  
    localStorage.setItem(
      "purchaseDraft",
      JSON.stringify(draft),
    );
  }, [supplierId, date, purchaseItems]);

  const handleIngredientChange = (
    index: number,
    value: RawIngredient | string | null,
  ) => {
    setPurchaseItems((previousItems) =>
      previousItems.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }
      
        if (typeof value === "string") {
          const normalizedValue = value.trim().toLowerCase();
        
          const existingIngredient = rawIngredients.find(
            (ingredient) =>
              ingredient.name.trim().toLowerCase() === normalizedValue,
          );
        
          if (existingIngredient) {
            const { newIngredientName, ...rest } = item;
          
            return {
              ...rest,
              rawIngredientId: existingIngredient.id,
            };
          }
        
          const { rawIngredientId, ...rest } = item;
        
          return {
            ...rest,
            newIngredientName: value,
          };
        }
      
        if (value) {
          const { newIngredientName, ...rest } = item;
        
          return {
            ...rest,
            rawIngredientId: value.id,
          };
        }
      
        const {
          rawIngredientId,
          newIngredientName,
          ...rest
        } = item;
      
        return rest;
      }),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedSupplierId = supplierId.trim();
    setSupplierError(null);
    setDateError(null);
    setFormError(null);
    if (!trimmedSupplierId) {
      setSupplierError("Supplier ID must be a non empty string.");
      return;
    }
    if (!date) {
      setDateError("Date must be a valid date");
      return;
    }

    const newErrors = [
      {
        itemName: null,
        orderUnits: null,
        weightKg: null,
        totalPrice: null,
      },
    ];
    let hasErrors = false;

    for (const p in purchaseItems) {
      newErrors[p] = {
        itemName: null,
        orderUnits: null,
        weightKg: null,
        totalPrice: null,
      };
      
      const weightKgNum = Number(purchaseItems[p].weightKg);
      const totalPriceNum = Number(purchaseItems[p].totalPrice);
      const rawIngredientId = purchaseItems[p].rawIngredientId;
      const newIngredientName =
        purchaseItems[p].newIngredientName?.trim();

      if (!rawIngredientId && !newIngredientName) {
        newErrors[p].itemName =
          "Select an existing ingredient or enter a new ingredient.";
        hasErrors = true;
      }

      if (Number.isNaN(weightKgNum) || weightKgNum <= 0) {
        newErrors[p].weightKg =
          "Weight Kg must be a positive number greater than zero.";
        hasErrors = true;
      }
      if (Number.isNaN(totalPriceNum) || totalPriceNum <= 0) {
        newErrors[p].totalPrice =
          "Total price must be a positive number greater than zero.";
        hasErrors = true;
      }
    }
    if (hasErrors) {
      setPurchaseItemErrors(newErrors);
      return;
    }

    setSubmitting(true);

    const data = {
      supplierId: trimmedSupplierId,
      date,
      items: purchaseItems.map((item) => ({
        ...item,
        weightKg: Number(item.weightKg),
        totalPrice: Number(item.totalPrice),
      })),
    };

    try {
      const response = await apiFetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create purchase");
      }
      const createdPurchase = await response.json();

      onPurchaseCreated(createdPurchase);
      onClose();
      setSupplierId("");
      setDate("");
      setPurchaseItems([
        {
          orderUnits: "",
          weightKg: "",
          totalPrice: "",
        },
      ]);

      setPurchaseItemErrors([]);
      localStorage.removeItem("purchaseDraft");
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to create purchase.");
      }
    } finally {
      setSubmitting(false);
    }
  };

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
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>New Purchase</DialogTitle>
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
        <form onSubmit={handleSubmit}>
          <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
            <FormControl error={!!supplierError} sx={{ minWidth: 200 }}>
              <InputLabel id="supplier-select-label">Supplier</InputLabel>
              <Select
                value={supplierId}
                onChange={handleSupplierChange}
                label="Supplier"
                labelId="supplier-select-label"
              >
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
              {!!supplierError && (
                <FormHelperText>{supplierError}</FormHelperText>
              )}
            </FormControl>
            <TextField
              error={!!dateError}
              helperText={dateError ? dateError : ""}
              label="Date"
              value={date}
              onChange={handleDateChange}
              type="date"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Stack>
          {purchaseItems.map((purchaseItem, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={2}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                alignItems: "flex-start",
              }}
            >
              <Autocomplete
                freeSolo
                options={rawIngredients}
                sx={{ minWidth: 250 }}
                getOptionLabel={(option) =>
                  typeof option === "string"
                    ? option
                    : option.name
                }
                value={
                  purchaseItem.rawIngredientId
                    ? rawIngredients.find(
                        (ingredient) =>
                          ingredient.id === purchaseItem.rawIngredientId,
                      ) ?? null
                    : purchaseItem.newIngredientName ?? null
                }
                onChange={(_, value) =>
                  handleIngredientChange(index, value)
                }
                onInputChange={(_, value, reason) => {
                  if (reason === "input") {
                    handleIngredientChange(index, value);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ingredient"
                    error={!!purchaseItemErrors[index]?.itemName}
                    helperText={
                      purchaseItemErrors[index]?.itemName ?? ""
                    }
                  />
                )}
              />
              <TextField
                error={!!purchaseItemErrors[index]?.orderUnits}
                helperText={
                  purchaseItemErrors[index]?.orderUnits
                    ? purchaseItemErrors[index]?.orderUnits
                    : ""
                }
                value={purchaseItem.orderUnits}
                onChange={(event) => handleOrderUnitsChange(index, event)}
                label="Order Units (optional)"
              />
              <TextField
                type="number"
                error={!!purchaseItemErrors[index]?.weightKg}
                helperText={
                  purchaseItemErrors[index]?.weightKg
                    ? purchaseItemErrors[index]?.weightKg
                    : ""
                }
                value={purchaseItem.weightKg}
                onChange={(event) => handleWeightChange(index, event)}
                label="Weight"
                slotProps={{
                  htmlInput: {
                    step: "any",
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                type="number"
                error={!!purchaseItemErrors[index]?.totalPrice}
                helperText={
                  purchaseItemErrors[index]?.totalPrice
                    ? purchaseItemErrors[index]?.totalPrice
                    : ""
                }
                value={purchaseItem.totalPrice}
                onChange={(event) => handleTotalPriceChange(index, event)}
                label="Total Price"
                slotProps={{
                  htmlInput: {
                    step: "any",
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  },
                }}
              />
              {purchaseItems.length > 1 && (
                <Button
                  type="button"
                  color="error"
                  onClick={() => handleRemoveItemClick(index)}
                >
                  Remove
                </Button>
              )}
            </Stack>
          ))}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button type="button" onClick={handleAddItemClick}>
              + Add Item
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Creating..." : "Create Purchase"}
            </Button>
          </Box>
        </form>
        {formError && <Alert severity="error">{formError}</Alert>}
      </DialogContent>
    </Dialog>
  );
}

export default CreatePurchaseDialog;
