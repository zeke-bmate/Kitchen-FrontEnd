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
import type { MeasurementUnit } from "../types/measurementUnit";
import apiFetch from "../api/apiFetch";
import { useTranslation } from "react-i18next";
import type { SupplyItem } from "../types/supplyItem";

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
    case "BOX":
      return "box";
    case "CASE":
      return "case";
    case "PACK":
      return "pack";
    case "ROLL":
      return "roll";
    case "BOTTLE":
      return "bottle";
  }
};

type EditPurchaseDialogProps = {
  open: boolean;
  purchase: Purchase | null;
  suppliers: Supplier[];
  rawIngredients: RawIngredient[];
  supplyItems: SupplyItem[];
  onClose: () => void;
  onPurchaseUpdated: (purchase: Purchase) => void;
};

function EditPurchaseDialog({
  open,
  purchase,
  suppliers,
  rawIngredients,
  supplyItems,
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

  const subtotal = purchaseItems.reduce((sum, item) => {
    const itemSubtotal = Number(item.subtotal);

    return sum + (Number.isNaN(itemSubtotal) ? 0 : itemSubtotal);
  }, 0);

  const taxAmount = purchaseItems.reduce((sum, item) => {
    const itemSubtotal = Number(item.subtotal);
    const itemTaxRate = Number(item.taxRate);

    if (
      Number.isNaN(itemSubtotal) ||
      Number.isNaN(itemTaxRate)
    ) {
      return sum;
    }

    const itemTax =
      Math.round(
        itemSubtotal * (itemTaxRate / 100) * 100
      ) / 100;

    return sum + itemTax;
  }, 0);

  const total =
    Math.round((subtotal + taxAmount) * 100) / 100;

  const handleAddItemClick = () => {
    setPurchaseItems((previousItems) => [
      ...previousItems,
      {
        itemType: "INGREDIENT",
        orderUnits: "",
        quantity: "",
        subtotal: "",
        taxRate: "0",
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

  const handleItemTypeChange = (
    index: number,
    itemType: "INGREDIENT" | "SUPPLY",
  ) => {
    setPurchaseItems((previousItems) =>
      previousItems.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }
      
        let currentName = "";
      
        if (item.itemType === "INGREDIENT") {
          if (item.rawIngredientId) {
            currentName =
              rawIngredients.find(
                (ingredient) =>
                  ingredient.id === item.rawIngredientId
              )?.name ?? "";
          } else {
            currentName = item.newIngredientName ?? "";
          }
        } else {
          if (item.supplyItemId) {
            currentName =
              supplyItems.find(
                (supplyItem) =>
                  supplyItem.id === item.supplyItemId
              )?.name ?? "";
          } else {
            currentName = item.newSupplyItemName ?? "";
          }
        }
      
        return {
          itemType,
          orderUnits: item.orderUnits,
          quantity: item.quantity,
          subtotal: item.subtotal,
          taxRate: item.taxRate,
        
          ...(itemType === "INGREDIENT" &&
            currentName && {
              newIngredientName: currentName,
            }),
          
          ...(itemType === "SUPPLY" &&
            currentName && {
              newSupplyItemName: currentName,
            }),
        };
      })
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
          itemType: item.rawIngredientId
            ? "INGREDIENT"
            : "SUPPLY",
        
          ...(item.rawIngredientId && {
            rawIngredientId: item.rawIngredientId,
          }),
        
          ...(item.supplyItemId && {
            supplyItemId: item.supplyItemId,
          }),
        
          orderUnits: item.orderUnits ?? "",
          quantity: String(item.quantity),
          subtotal: String(item.subtotal),
          taxRate: String(item.taxRate),
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
      subtotal: null,
      taxRate: null,
      canonicalUnit: null,
    }));
  
    purchaseItems.forEach((item, index) => {
      const quantity = Number(item.quantity);
      const itemSubtotal = Number(item.subtotal);
      const itemTaxRate = Number(item.taxRate);
  
      if (
        item.itemType === "INGREDIENT" &&
        !item.rawIngredientId &&
        !item.newIngredientName?.trim()
      ) {
        newErrors[index].itemName =
          t("purchases.form.errors.existingIngredientRequired");
        hasErrors = true;
      }

      if (
        item.itemType === "SUPPLY" &&
        !item.supplyItemId &&
        !item.newSupplyItemName?.trim()
      ) {
        newErrors[index].itemName =
          t("purchases.form.errors.existingSupplyItemRequired");
        hasErrors = true;
      }

      const isNewItem =
        !!item.newIngredientName?.trim() ||
        !!item.newSupplyItemName?.trim();

      if (isNewItem && !item.canonicalUnit) {
        newErrors[index].canonicalUnit =
          t("purchases.form.errors.unitRequired");
      
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
        Number.isNaN(itemSubtotal) ||
        itemSubtotal <= 0
      ) {
        newErrors[index].subtotal =
          t("purchases.form.errors.subtotalPositive");
        hasErrors = true;
      }

      if (
        item.taxRate.trim() === "" ||
        !Number.isFinite(itemTaxRate) ||
        itemTaxRate < 0 ||
        itemTaxRate > 100
      ) {
        newErrors[index].taxRate =
          t("purchases.form.errors.taxRateInvalid");
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
        ...(item.itemType === "INGREDIENT" &&
          item.rawIngredientId && {
            rawIngredientId: item.rawIngredientId,
          }),
        
        ...(item.itemType === "INGREDIENT" &&
          !item.rawIngredientId &&
          item.newIngredientName?.trim() && {
            newIngredientName:
              item.newIngredientName.trim(),
            canonicalUnit: item.canonicalUnit,
          }),
        
        ...(item.itemType === "SUPPLY" &&
          item.supplyItemId && {
            supplyItemId: item.supplyItemId,
          }),
        
        ...(item.itemType === "SUPPLY" &&
          !item.supplyItemId &&
          item.newSupplyItemName?.trim() && {
            newSupplyItemName:
              item.newSupplyItemName.trim(),
            canonicalUnit: item.canonicalUnit,
          }),
        
        orderUnits: item.orderUnits?.trim() || null,
        quantity: Number(item.quantity),
        subtotal: Number(item.subtotal),
        taxRate: Number(item.taxRate),
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
        <form onSubmit={handleSubmit} noValidate>
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
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>
                  {t("purchases.form.itemType")}
                </InputLabel>

                <Select
                  value={purchaseItem.itemType}
                  label={t("purchases.form.itemType")}
                  onChange={(event) =>
                    handleItemTypeChange(
                      index,
                      event.target.value as "INGREDIENT" | "SUPPLY"
                    )
                  }
                >
                  <MenuItem value="INGREDIENT">
                    {t("purchases.form.itemTypes.ingredient")}
                  </MenuItem>
                
                  <MenuItem value="SUPPLY">
                    {t("purchases.form.itemTypes.supply")}
                  </MenuItem>
                </Select>
              </FormControl>
              {purchaseItem.itemType === "INGREDIENT" ? (
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
                            ingredient.id ===
                            purchaseItem.rawIngredientId
                        ) ?? null
                      : purchaseItem.newIngredientName ?? ""
                  }
                  onChange={(_, value) => {
                    setPurchaseItems((previousItems) =>
                      previousItems.map((item, itemIndex) => {
                        if (itemIndex !== index) {
                          return item;
                        }
                      
                        if (typeof value === "string") {
                          return {
                            ...item,
                            rawIngredientId: undefined,
                            newIngredientName: value,
                          };
                        }
                      
                        if (value) {
                          return {
                            ...item,
                            rawIngredientId: value.id,
                            newIngredientName: undefined,
                            canonicalUnit: undefined,
                          };
                        }
                      
                        return {
                          ...item,
                          rawIngredientId: undefined,
                          newIngredientName: undefined,
                          canonicalUnit: undefined,
                        };
                      })
                    );
                  }}
                  onInputChange={(_, value, reason) => {
                    if (reason !== "input") {
                      return;
                    }
                  
                    setPurchaseItems((previousItems) =>
                      previousItems.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              rawIngredientId: undefined,
                              newIngredientName: value,
                            }
                          : item
                      )
                    );
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
              ) : (
                <Autocomplete
                  freeSolo
                  options={supplyItems}
                  sx={{ minWidth: 250 }}
                  getOptionLabel={(option) =>
                    typeof option === "string"
                      ? option
                      : option.name
                  }
                  value={
                    purchaseItem.supplyItemId
                      ? supplyItems.find(
                          (supplyItem) =>
                            supplyItem.id ===
                            purchaseItem.supplyItemId
                        ) ?? null
                      : purchaseItem.newSupplyItemName ?? ""
                  }
                  onChange={(_, value) => {
                    setPurchaseItems((previousItems) =>
                      previousItems.map((item, itemIndex) => {
                        if (itemIndex !== index) {
                          return item;
                        }
                      
                        if (typeof value === "string") {
                          return {
                            ...item,
                            supplyItemId: undefined,
                            newSupplyItemName: value,
                          };
                        }
                      
                        if (value) {
                          return {
                            ...item,
                            supplyItemId: value.id,
                            newSupplyItemName: undefined,
                            canonicalUnit: undefined,
                          };
                        }
                      
                        return {
                          ...item,
                          supplyItemId: undefined,
                          newSupplyItemName: undefined,
                          canonicalUnit: undefined,
                        };
                      })
                    );
                  }}
                  onInputChange={(_, value, reason) => {
                    if (reason !== "input") {
                      return;
                    }
                  
                    setPurchaseItems((previousItems) =>
                      previousItems.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              supplyItemId: undefined,
                              newSupplyItemName: value,
                            }
                          : item
                      )
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("purchases.form.supplyItem")}
                      error={!!purchaseItemErrors[index]?.itemName}
                      helperText={
                        purchaseItemErrors[index]?.itemName ?? ""
                      }
                    />
                  )}
                />
              )}

              {(
                purchaseItem.newIngredientName ||
                purchaseItem.newSupplyItemName
              ) && (
                <FormControl error={!!purchaseItemErrors[index]?.canonicalUnit} sx={{ minWidth: 120 }}>
                  <InputLabel>
                    {t("purchases.form.canonicalUnit")}
                  </InputLabel>
              
                  <Select
                    value={purchaseItem.canonicalUnit ?? ""}
                    label={t("purchases.form.canonicalUnit")}
                    onChange={(event) => {
                      setPurchaseItems((previousItems) =>
                        previousItems.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                canonicalUnit:
                                  event.target.value as MeasurementUnit,
                              }
                            : item
                        )
                      );
                    }}
                  >
                    {[
                      "KG",
                      "L",
                      "EACH",
                      "BUNCH",
                      "HEAD",
                      "BOX",
                      "CASE",
                      "PACK",
                      "ROLL",
                      "BOTTLE",
                    ].map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {formatUnit(unit as MeasurementUnit)}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!purchaseItemErrors[index]?.canonicalUnit && (
                    <FormHelperText>
                      {purchaseItemErrors[index]?.canonicalUnit}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
  
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
                        {purchaseItem.itemType === "INGREDIENT" &&
                        purchaseItem.rawIngredientId
                          ? formatUnit(
                              rawIngredients.find(
                                (ingredient) =>
                                  ingredient.id === purchaseItem.rawIngredientId
                              )?.canonicalUnit ?? "KG"
                            )
                          : purchaseItem.itemType === "SUPPLY" &&
                              purchaseItem.supplyItemId
                            ? formatUnit(
                                supplyItems.find(
                                  (supplyItem) =>
                                    supplyItem.id === purchaseItem.supplyItemId
                                )?.canonicalUnit ?? "EACH"
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
                label={t("purchases.form.subtotal")}
                value={purchaseItem.subtotal}
                onChange={(event) => {
                  setPurchaseItems((previousItems) =>
                    previousItems.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            subtotal: event.target.value,
                          }
                        : item
                    )
                  );
                }}
                error={!!purchaseItemErrors[index]?.subtotal}
                helperText={
                  purchaseItemErrors[index]?.subtotal ?? ""
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
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
              <TextField
                type="number"
                label={t("purchases.form.taxRate")}
                value={purchaseItem.taxRate}
                onChange={(event) => {
                  setPurchaseItems((previousItems) =>
                    previousItems.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            taxRate: event.target.value,
                          }
                        : item
                    )
                  );
                }}
                error={!!purchaseItemErrors[index]?.taxRate}
                helperText={
                  purchaseItemErrors[index]?.taxRate ?? ""
                }
                sx={{ width: 130 }}
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
                <Typography>
                  {t("purchases.form.subtotal")}
                </Typography>
          
                <Typography>
                  ₡{subtotal.toFixed(2)}
                </Typography>
              </Stack>
          
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between" }}
              >
                <Typography>
                  {t("purchases.form.tax")}
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