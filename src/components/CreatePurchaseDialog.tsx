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
  Divider,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import type { Purchase } from "../types/purchase";
import type { PurchaseItemInput } from "../types/purchaseItemInput";
import type { PurchaseItemError } from "../types/purchaseItemError";
import type { Supplier } from "../types/supplier";
import type { RawIngredient } from "../types/rawIngredient";
import apiFetch from "../api/apiFetch";
import type { MeasurementUnit } from "../types/measurementUnit";
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
  const { t } = useTranslation();
  const draft = getPurchaseDraft();
  const [supplierId, setSupplierId] = useState<string>(draft?.supplierId ?? "");
  const [date, setDate] = useState<string>(draft?.date ?? "");
  const [taxRate, setTaxRate] = useState<string>(String(draft?.taxRate ?? 0));
  const [supplierError, setSupplierError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [taxRateError, setTaxRateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemInput[]>(
    draft?.purchaseItems?.length
      ? draft.purchaseItems
      : [
          {
            orderUnits: "",
            quantity: "",
            totalPrice: "",
          },
        ]
  );
  const [purchaseItemErrors, setPurchaseItemErrors] = useState<
    PurchaseItemError[]
  >([]);

  const subtotal = purchaseItems.reduce((sum, item) => {
    const itemTotal = Number(item.totalPrice);

    return sum + (Number.isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);

  const taxRateNum = Number(taxRate);

  const taxAmount = Math.round(subtotal * ((Number.isNaN(taxRateNum) ? 0 : taxRateNum) / 100) * 100) / 100;

  const total = Math.round((subtotal + taxAmount) * 100) / 100;
  
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

  const handleQuantityChange = (index, event) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index].quantity = event.target.value;
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

  const handleCanonicalUnitChange = (
    index: number,
    unit: MeasurementUnit,
  ) => {
    setPurchaseItems((previousItems) =>
      previousItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              canonicalUnit: unit,
            }
          : item
      )
    );
  };

  useEffect(() => {
    const draft = {
      supplierId,
      date,
      taxRate,
      purchaseItems,
    };
  
    localStorage.setItem(
      "purchaseDraft",
      JSON.stringify(draft),
    );
  }, [supplierId, date, taxRate, purchaseItems]);

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
            const {
              newIngredientName,
              canonicalUnit,
              ...rest
            } = item;
          
            return {
              ...rest,
              rawIngredientId: existingIngredient.id,
            };
          }
        
          const { rawIngredientId, ...rest } = item;
        
          return {
            ...rest,
            newIngredientName: value,
            canonicalUnit: item.canonicalUnit ?? "KG",
          };
        }
      
        if (value) {
          const {
            newIngredientName,
            canonicalUnit,
            ...rest
          } = item;
        
          return {
            ...rest,
            rawIngredientId: value.id,
          };
        }
      
        const {
          rawIngredientId,
          newIngredientName,
          canonicalUnit,
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
    setTaxRateError(null);
    setFormError(null);
    if (!trimmedSupplierId) {
      setSupplierError(t("purchases.form.errors.supplierRequired"));
      return;
    }
    if (!date) {
      setDateError(t("purchases.form.errors.dateRequired"));
      return;
    }
    if (
      Number.isNaN(taxRateNum) ||
      taxRateNum < 0 ||
      taxRateNum > 100
    ) {
      setTaxRateError(t("purchases.form.errors.taxRateInvalid"));
      return;
    }

    const newErrors = [
      {
        itemName: null,
        orderUnits: null,
        quantity: null,
        totalPrice: null,
      },
    ];
    let hasErrors = false;

    for (const p in purchaseItems) {
      newErrors[p] = {
        itemName: null,
        orderUnits: null,
        quantity: null,
        totalPrice: null,
      };
      
      const quantityNum = Number(purchaseItems[p].quantity);
      const totalPriceNum = Number(purchaseItems[p].totalPrice);
      const rawIngredientId = purchaseItems[p].rawIngredientId;
      const newIngredientName =
        purchaseItems[p].newIngredientName?.trim();

      if (!rawIngredientId && !newIngredientName) {
        newErrors[p].itemName =
          t("purchases.form.errors.ingredientRequired");
        hasErrors = true;
      }

      if (Number.isNaN(quantityNum) || quantityNum <= 0) {
        newErrors[p].quantity =
          t("purchases.form.errors.quantityPositive");
        hasErrors = true;
      }
      if (Number.isNaN(totalPriceNum) || totalPriceNum <= 0) {
        newErrors[p].totalPrice =
          t("purchases.form.errors.totalPricePositive");
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
      taxRate: taxRateNum,
      items: purchaseItems.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
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
        throw new Error(errorData.error || t("purchases.form.createFailed"));
      }
      const createdPurchase = await response.json();

      onPurchaseCreated(createdPurchase);
      onClose();
      setSupplierId("");
      setDate("");
      setTaxRate("0");
      setPurchaseItems([
        {
          orderUnits: "",
          quantity: "",
          totalPrice: "",
        },
      ]);

      setPurchaseItemErrors([]);
      localStorage.removeItem("purchaseDraft");
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(t("purchases.form.errors.createFailed"));
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
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>{t("purchases.form.createTitle")}</DialogTitle>
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
        <form onSubmit={handleSubmit} noValidate>
          <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
            <FormControl error={!!supplierError} sx={{ minWidth: 200 }}>
              <InputLabel id="supplier-select-label">{t("purchases.form.supplier")}</InputLabel>
              <Select
                value={supplierId}
                onChange={handleSupplierChange}
                label={t("purchases.form.supplier")}
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
              label={t("purchases.form.date")}
              value={date}
              onChange={handleDateChange}
              type="date"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <TextField
              type="number"
              label={t("purchases.form.taxRate")}
              value={taxRate}
              onChange={(event) => {
                setTaxRateError(null);
                setTaxRate(event.target.value);
              }}
              error={!!taxRateError}
              helperText={taxRateError ?? ""}
              sx={{ width: 180 }}
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: 100,
                  step: "any",
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      %
                    </InputAdornment>
                  ),
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
                    label={t("purchases.form.ingredient")}
                    error={!!purchaseItemErrors[index]?.itemName}
                    helperText={
                      purchaseItemErrors[index]?.itemName ?? ""
                    }
                  />
                )}
              />
              {purchaseItem.newIngredientName &&
                !purchaseItem.rawIngredientId && (
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>{t("purchases.form.canonicalUnit")}</InputLabel>
                
                    <Select
                      value={purchaseItem.canonicalUnit ?? "KG"}
                      label={t("purchases.form.canonicalUnit")}
                      onChange={(event) =>
                        handleCanonicalUnitChange(
                          index,
                          event.target.value as MeasurementUnit
                        )
                      }
                    >
                      <MenuItem value="KG">kg</MenuItem>
                      <MenuItem value="L">L</MenuItem>
                      <MenuItem value="EACH">each</MenuItem>
                      <MenuItem value="BUNCH">bunch</MenuItem>
                      <MenuItem value="HEAD">head</MenuItem>
                    </Select>
                  </FormControl>
                )}
              <TextField
                error={!!purchaseItemErrors[index]?.orderUnits}
                helperText={
                  purchaseItemErrors[index]?.orderUnits
                    ? purchaseItemErrors[index]?.orderUnits
                    : ""
                }
                value={purchaseItem.orderUnits}
                onChange={(event) => handleOrderUnitsChange(index, event)}
                label={t("purchases.form.orderUnits")}
              />
              <TextField
                type="number"
                error={!!purchaseItemErrors[index]?.quantity}
                helperText={
                  purchaseItemErrors[index]?.quantity ?? ""
                }
                value={purchaseItem.quantity}
                onChange={(event) =>
                  handleQuantityChange(index, event)
                }
                label={t("purchases.form.quantity")}
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
                          : purchaseItem.canonicalUnit
                            ? formatUnit(purchaseItem.canonicalUnit)
                            : ""}
                      </InputAdornment>
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
                label={t("purchases.form.totalPrice")}
                slotProps={{
                  htmlInput: {
                    step: "any",
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="start">₡</InputAdornment>
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button type="button" onClick={handleAddItemClick}>
              {t("purchases.form.addItem")}
            </Button>
          </Box>
          <Box
            sx={{
              ml: "auto",
              width: 320,
              mb: 3,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between" }}
              >
                <Typography>{t("purchases.form.subtotal")}</Typography>
          
                <Typography>
                  ₡{subtotal.toFixed(2)}
                </Typography>
              </Stack>
          
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between" }}
              >
                <Typography>
                  {t("purchases.form.tax")} ({Number.isNaN(taxRateNum) ? 0 : taxRateNum}%)
                </Typography>
          
                <Typography>
                  ₡{taxAmount.toFixed(2)}
                </Typography>
              </Stack>
          
              <Divider />
          
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between" }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {t("purchases.form.grandTotal")}
                </Typography>
          
                <Typography sx={{ fontWeight: 700 }}>
                  ₡{total.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? t("purchases.form.creating") : t("purchases.form.create")}
            </Button>
          </Box>
        </form>
        {formError && <Alert severity="error">{formError}</Alert>}
      </DialogContent>
    </Dialog>
  );
}

export default CreatePurchaseDialog;
