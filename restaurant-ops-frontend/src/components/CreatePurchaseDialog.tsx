import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import type { Purchase } from "../types/purchase";
import type { PurchaseItemInput } from "../types/purchaseItemInput";
import type { PurchaseItemError } from "../types/purchaseItemError";
import type { Supplier } from "../types/supplier";

type CreatePurchaseDialogProps = {
    open: boolean;
    onClose: () => void;
    onPurchaseCreated: (purchase: Purchase) => void;
    suppliers: Supplier[];
}

function CreatePurchaseDialog({
    open,
    onClose,
    onPurchaseCreated,
    suppliers,
}: CreatePurchaseDialogProps) {

    const [supplierId, setSupplierId] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [supplierError, setSupplierError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItemInput[]>([{
        itemName: "",
        orderUnits: "",
        weightKg: 0,
        pricePerKg: 0,
      }]);
    const [purchaseItemErrors, setPurchaseItemErrors] = useState<PurchaseItemError[]>([]);

    const handleAddItemClick = () => {
        setPurchaseItems(previousItems => [...previousItems, {
            itemName: "",
            orderUnits: "",
            weightKg: 0,
            pricePerKg: 0,
        }]);
    }

    const handleRemoveItemClick = (indexToRemove) => {
        const filteredItems = purchaseItems.filter((_, index) => index !== indexToRemove);
        setPurchaseItems(filteredItems);
    }

    const handleItemNameChange = (index, event) => {
        const updatedItems = [...purchaseItems];
        updatedItems[index].itemName = (event.target.value);
        setPurchaseItems(updatedItems);
    }

    const handleOrderUnitsChange = (index, event) => {
        const updatedItems = [...purchaseItems];
        updatedItems[index].orderUnits = (event.target.value);
        setPurchaseItems(updatedItems);
    }

    const handleWeightChange = (index, event) => {
        const updatedItems = [...purchaseItems];
        updatedItems[index].weightKg = Number(event.target.value);
        setPurchaseItems(updatedItems);
    }

    const handlePriceChange = (index, event) => {
        const updatedItems = [...purchaseItems];
        updatedItems[index].pricePerKg = Number(event.target.value);
        setPurchaseItems(updatedItems);
    }

    const handleSupplierChange = (event) => {
        setSupplierError(null);
        setSupplierId(event.target.value);
    }

    const handleDateChange = (event) => {
        setDateError(null);
        setDate(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedSupplierId = supplierId.trim()
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
        
        const newErrors = [{
            itemName: null,
            orderUnits: null,
            weightKg: null,
            pricePerKg: null,
        }]
        let hasErrors = false;

        for (const p in purchaseItems) {
            newErrors[p] = {
                itemName: null,
                orderUnits: null,
                weightKg: null,
                pricePerKg: null,
            }
            const trimmedItemName = purchaseItems[p].itemName.trim();
            const trimmedOrderUnits = purchaseItems[p].orderUnits.trim();
            const weightKgNum = Number(purchaseItems[p].weightKg);
            const pricePerKgNum = Number(purchaseItems[p].pricePerKg);

            if (!trimmedItemName) {
                newErrors[p].itemName = "Item Name must be a non empty string."
                hasErrors = true;
            }
            if (!trimmedOrderUnits) {
                newErrors[p].orderUnits = "Order Units must be a non empty string."
                hasErrors = true;
            }
            if (Number.isNaN(weightKgNum) || weightKgNum <= 0) {
                newErrors[p].weightKg = "Weight Kg must be a positive number greater than zero."
                hasErrors = true;
            }
            if (Number.isNaN(pricePerKgNum) || pricePerKgNum <= 0) {
                newErrors[p].pricePerKg = "Price per Kg must be a positive number greater than zero."
                hasErrors = true;
            }
        }
        if (hasErrors) {
            setPurchaseItemErrors(newErrors);
            return;
        }

        setSubmitting(true);
        const data = { supplierId: trimmedSupplierId, date: date, items: purchaseItems }
        try {
            const response = await fetch('http://localhost:3001/api/purchases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        
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
                itemName: "",
                orderUnits: "",
                weightKg: 0,
                pricePerKg: 0,
            },
        ]);
        
        setPurchaseItemErrors([]);
        } catch (error) {
            if (error instanceof Error) {
                setFormError(error.message);
            } else {
                setFormError("Failed to create purchase.");
            }
        } finally {
            setSubmitting(false);
        }
    }

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
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
                <CloseIcon />
            </IconButton> 
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Stack direction="row" spacing={5} sx={{ mb: 3}}>
                        <FormControl error={!!supplierError}sx={{ minWidth: 200 }}>
                            <InputLabel id="supplier-select-label">Supplier</InputLabel>
                            <Select 
                                value={supplierId} 
                                onChange={handleSupplierChange} 
                                label="Supplier" 
                                labelId="supplier-select-label"
                                >
                                {suppliers.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))}
                            </Select>
                            {!!supplierError && <FormHelperText>{supplierError}</FormHelperText>}
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
                                <TextField
                                    error={!!purchaseItemErrors[index]?.itemName}
                                    helperText={purchaseItemErrors[index]?.itemName ? purchaseItemErrors[index]?.itemName : ""}
                                    value={purchaseItem.itemName}
                                    onChange={(event) => handleItemNameChange(index, event)}
                                    label="Item Name"
                                />
                                <TextField
                                    error={!!purchaseItemErrors[index]?.orderUnits}
                                    helperText={purchaseItemErrors[index]?.orderUnits ? purchaseItemErrors[index]?.orderUnits : ""}
                                    value={purchaseItem.orderUnits}
                                    onChange={(event) => handleOrderUnitsChange(index, event)}
                                    label="Order Units"
                                />
                                <TextField
                                    type="Number"
                                    error={!!purchaseItemErrors[index]?.weightKg}
                                    helperText={purchaseItemErrors[index]?.weightKg ? purchaseItemErrors[index]?.weightKg : ""}
                                    value={purchaseItem.weightKg}
                                    onChange={(event) => handleWeightChange(index, event)}
                                    label="Weight"
                                    slotProps={{
                                        input: {
                                          endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                                        },
                                      }}
                                />
                                <TextField
                                    type="Number"
                                    error={!!purchaseItemErrors[index]?.pricePerKg}
                                    helperText={purchaseItemErrors[index]?.pricePerKg ? purchaseItemErrors[index]?.pricePerKg : ""}
                                    value={purchaseItem.pricePerKg}
                                    onChange={(event) => handlePriceChange(index, event)}
                                    label="Price per Kg"
                                    slotProps={{
                                        input: {
                                          endAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        },
                                      }}
                                />
                                {purchaseItems.length > 1 && <Button type="button" color="error" onClick={() => handleRemoveItemClick(index)}>
                                    Remove
                                </Button>}
                                
                            </Stack>
                        ))}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button
                                type="button"
                                onClick={handleAddItemClick}
                            >
                                + Add Item
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>             
                            <Button type='submit' variant="contained" disabled={submitting}>
                                {submitting ? "Creating..." : "Create Purchase"}
                            </Button>
                        </Box> 
                    </form>
                {formError && <Alert severity="error">{formError}</Alert>}
                </DialogContent>
        </Dialog>
    )
}

export default CreatePurchaseDialog;