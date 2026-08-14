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
import type { MeasurementUnit } from "../types/measurementUnit";
import apiFetch from "../api/apiFetch";

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

type EditPurchaseDialogProps = {
  open: boolean;
  purchase: Purchase | null;
  suppliers: Supplier[];
  rawIngredients: RawIngredient[];
  onClose: () => void;
  onPurchaseUpdated: (purchase: Purchase) => void;
};

function EditPurchaseDialog({
  open,
  purchase,
  suppliers,
  rawIngredients,
  onClose,
  onPurchaseUpdated,
}: EditPurchaseDialogProps) {
  const [supplierId, setSupplierId] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [purchaseItems, setPurchaseItems] = useState<
    PurchaseItemInput[]
  >([]);
  const [supplierError, setSupplierError] =
    useState<string | null>(null);
  const [dateError, setDateError] =
    useState<string | null>(null);
  const [reasonError, setReasonError] =
    useState<string | null>(null);
  const [formError, setFormError] =
    useState<string | null>(null);
  const [purchaseItemErrors, setPurchaseItemErrors] =
    useState<PurchaseItemError[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddItemClick = () => {
    setPurchaseItems((previousItems) => [
      ...previousItems,
      {
        orderUnits: "",
        quantity: "",
        totalPrice: "",
      },
    ]);
  };
  
  const handleRemoveItemClick = (indexToRemove: number) => {
    setPurchaseItems((previousItems) =>
      previousItems.filter(
        (_, index) => index !== indexToRemove,
      ),
    );
  };

  useEffect(() => {
      if (!open || !purchase) {
        return;
      }
  
      setSupplierId(purchase.supplierId);
  
      setDate(
        new Date(purchase.date).toISOString().split("T")[0]
      );
  
      setReason("");
  
      setPurchaseItems(
        purchase.items.map((item) => ({
          rawIngredientId: item.rawIngredientId ?? undefined,
          orderUnits: item.orderUnits ?? "",
          quantity: String(item.quantity),
          totalPrice: String(item.totalPrice),
        }))
      );
  
      setSupplierError(null);
      setDateError(null);
      setReasonError(null);
      setFormError(null);
      setPurchaseItemErrors([]);
  },[open, purchase]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
  
    if (!purchase) {
      return;
    }
  
    setSupplierError(null);
    setDateError(null);
    setReasonError(null);
    setFormError(null);
    setPurchaseItemErrors([]);
  
    const trimmedSupplierId = supplierId.trim();
    const trimmedReason = reason.trim();
  
    let hasErrors = false;
  
    if (!trimmedSupplierId) {
      setSupplierError("Supplier is required.");
      hasErrors = true;
    }
  
    if (!date) {
      setDateError("Date is required.");
      hasErrors = true;
    }
  
    if (!trimmedReason) {
      setReasonError("Correction reason is required.");
      hasErrors = true;
    }
  
    const newErrors: PurchaseItemError[] =
      purchaseItems.map(() => ({
        itemName: null,
        orderUnits: null,
        quantity: null,
        totalPrice: null,
      }));
  
    purchaseItems.forEach((item, index) => {
      const quantity = Number(item.quantity);
      const totalPrice = Number(item.totalPrice);
  
      if (!item.rawIngredientId) {
        newErrors[index].itemName =
          "An existing raw ingredient is required.";
        hasErrors = true;
      }
  
      if (
        Number.isNaN(quantity) ||
        quantity <= 0
      ) {
        newErrors[index].quantity =
          "Quantity must be greater than zero.";
        hasErrors = true;
      }
  
      if (
        Number.isNaN(totalPrice) ||
        totalPrice <= 0
      ) {
        newErrors[index].totalPrice =
          "Total price must be greater than zero.";
        hasErrors = true;
      }
    });
  
    if (hasErrors) {
      setPurchaseItemErrors(newErrors);
      return;
    }
  
    setSubmitting(true);
  
    const data = {
      supplierId: trimmedSupplierId,
      date,
      reason: trimmedReason,
      items: purchaseItems.map((item) => ({
        rawIngredientId: item.rawIngredientId,
        orderUnits: item.orderUnits?.trim() || null,
        quantity: Number(item.quantity),
        totalPrice: Number(item.totalPrice),
      })),
    };
  
    try {
      const response = await apiFetch(
        `/api/purchases/${purchase.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
  
        throw new Error(
          errorData.error || "Failed to update purchase."
        );
      }
  
      const updatedPurchase: Purchase =
        await response.json();
  
      onPurchaseUpdated(updatedPurchase);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to update purchase.");
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
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        Edit Purchase
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
        <form onSubmit={handleSubmit}>
          <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
            <FormControl error={!!supplierError} sx={{ minWidth: 200 }}>
              <InputLabel id="edit-supplier-select-label">
                Supplier
              </InputLabel>
  
              <Select
                value={supplierId}
                label="Supplier"
                labelId="edit-supplier-select-label"
                onChange={(event) => {
                  setSupplierError(null);
                  setSupplierId(event.target.value);
                }}
              >
                {suppliers.map((supplier) => (
                  <MenuItem
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
  
              {!!supplierError && (
                <FormHelperText>
                  {supplierError}
                </FormHelperText>
              )}
            </FormControl>
  
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(event) => {
                setDateError(null);
                setDate(event.target.value);
              }}
              error={!!dateError}
              helperText={dateError ?? ""}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Stack>
  
          <TextField
            fullWidth
            label="Correction Reason"
            value={reason}
            onChange={(event) => {
              setReasonError(null);
              setReason(event.target.value);
            }}
            error={!!reasonError}
            helperText={reasonError ?? ""}
            sx={{ mb: 3 }}
          />
  
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
                options={rawIngredients}
                sx={{ minWidth: 250 }}
                getOptionLabel={(option) => option.name}
                value={
                  purchaseItem.rawIngredientId
                    ? rawIngredients.find(
                        (ingredient) =>
                          ingredient.id ===
                          purchaseItem.rawIngredientId
                      ) ?? null
                    : null
                }
                onChange={(_, value) => {
                  setPurchaseItems((previousItems) =>
                    previousItems.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            rawIngredientId:
                              value?.id ?? undefined,
                          }
                        : item
                    )
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ingredient"
                    error={
                      !!purchaseItemErrors[index]?.itemName
                    }
                    helperText={
                      purchaseItemErrors[index]?.itemName ??
                      ""
                    }
                  />
                )}
              />
  
              <TextField
                value={purchaseItem.orderUnits}
                label="Order Units (optional)"
                onChange={(event) => {
                  setPurchaseItems((previousItems) =>
                    previousItems.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            orderUnits: event.target.value,
                          }
                        : item
                    )
                  );
                }}
              />
  
              <TextField
                type="number"
                label="Quantity"
                value={purchaseItem.quantity}
                onChange={(event) => {
                  setPurchaseItems((previousItems) =>
                    previousItems.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            quantity: event.target.value,
                          }
                        : item
                    )
                  );
                }}
                error={
                  !!purchaseItemErrors[index]?.quantity
                }
                helperText={
                  purchaseItemErrors[index]?.quantity ?? ""
                }
                slotProps={{
                  htmlInput: {
                    step: "any",
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        {purchaseItem.rawIngredientId
                          ? formatUnit(
                              rawIngredients.find(
                                (ingredient) =>
                                  ingredient.id ===
                                  purchaseItem.rawIngredientId
                              )?.canonicalUnit ?? "KG"
                            )
                          : ""}
                      </InputAdornment>
                    ),
                  },
                }}
              />
  
              <TextField
                type="number"
                label="Total Price"
                value={purchaseItem.totalPrice}
                onChange={(event) => {
                  setPurchaseItems((previousItems) =>
                    previousItems.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            totalPrice: event.target.value,
                          }
                        : item
                    )
                  );
                }}
                error={
                  !!purchaseItemErrors[index]?.totalPrice
                }
                helperText={
                  purchaseItemErrors[index]?.totalPrice ?? ""
                }
                slotProps={{
                  htmlInput: {
                    step: "any",
                  },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        ₡
                      </InputAdornment>
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

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 2,
            }}
          >
            <Button
              type="button"
              onClick={handleAddItemClick}
            >
              + Add Item
            </Button>
          </Box>
  
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Save Changes"}
            </Button>
          </Box>
        </form>
  
        {formError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {formError}
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EditPurchaseDialog;