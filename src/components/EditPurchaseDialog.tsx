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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(); 
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
      setSupplierError(t("purchases.form.errors.supplierRequired"));
      hasErrors = true;
    }
  
    if (!date) {
      setDateError(t("purchases.form.errors.dateRequired"));
      hasErrors = true;
    }
  
    if (!trimmedReason) {
      setReasonError(t("purchases.form.errors.reasonRequired"));
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
          t("purchases.form.errors.existingIngredientRequired");
        hasErrors = true;
      }
  
      if (
        Number.isNaN(quantity) ||
        quantity <= 0
      ) {
        newErrors[index].quantity =
          t("purchases.form.errors.quantityPositive");
        hasErrors = true;
      }
  
      if (
        Number.isNaN(totalPrice) ||
        totalPrice <= 0
      ) {
        newErrors[index].totalPrice =
          t("purchases.form.errors.totalPricePositive");
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
          errorData.error || t("purchases.form.errors.updateFailed")
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
        setFormError(t("purchases.form.errors.updateFailed"));
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
        {t("purchases.form.editTitle")}
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
                {t("purchases.form.supplier")}
              </InputLabel>
  
              <Select
                value={supplierId}
                label={t("purchases.form.supplier")}
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
              label={t("purchases.form.date")}
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
            label={t("purchases.form.correctionReason")}
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
                    label={t("purchases.form.ingredient")}
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
                label={t("purchases.form.orderUnits")}
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
                label={t("purchases.form.quantity")}
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
                label={t("purchases.form.totalPrice")}
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
                  {t("purchases.form.remove")}
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
              {t("purchases.form.addItem")}
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
              {submitting ? t("purchases.form.updating") : t("purchases.form.saveChanges")}
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