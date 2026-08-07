import { useEffect, useState } from "react";
import type { RawIngredient } from "../types/rawIngredient";
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import apiFetch from "../api/apiFetch";

type AdjustInventoryDialogProps = {
  open: boolean;
  ingredient: RawIngredient | null;
  onClose: () => void;
  onInventoryUpdated: (ingredient: RawIngredient) => void;
};

function AdjustmentInventoryDialog({
    open,
    ingredient,
    onClose,
    onInventoryUpdated,
}: AdjustInventoryDialogProps) {

    const [currentWeightKg, setCurrentWeightKg] = useState("");
    const [reason, setReason] = useState("");
    const [weightError, setWeightError] = useState<string | null>(null);
    const [reasonError, setReasonError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleWeightChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setWeightError(null);
      setCurrentWeightKg(event.target.value);
    };

    const handleReasonChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setReasonError(null);
      setReason(event.target.value);
    };

    const handleSubmit = async (
      event: React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();
    
      if (!ingredient) {
        return;
      }
  
      const weightNumber = Number(currentWeightKg);
      const trimmedReason = reason.trim();
  
      setWeightError(null);
      setReasonError(null);
      setFormError(null);
  
      if (
        Number.isNaN(weightNumber) ||
        weightNumber < 0
      ) {
        setWeightError("Weight must be a non-negative number.");
        return;
      }
  
      setSubmitting(true);
  
      const data = {
        currentWeightKg: weightNumber,
        ...(trimmedReason && { reason: trimmedReason }),
      };
  
      try {
        const response = await apiFetch(
          `/api/raw-ingredients/${ingredient.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );
    
        if (!response.ok) {
          const errorData = await response.json();
        
          throw new Error(
            errorData.error || "Failed to adjust inventory.",
          );
        }
    
        const updatedIngredient: RawIngredient =
          await response.json();
    
        onInventoryUpdated(updatedIngredient);
        onClose();
      } catch (error) {
        if (error instanceof Error) {
          setFormError(error.message);
        } else {
          setFormError("Failed to adjust inventory.");
        }
      } finally {
        setSubmitting(false);
      }
    };

    useEffect(() => {
      if (ingredient) {
        setCurrentWeightKg(String(ingredient.currentWeightKg));
      }
    }, [ingredient]);

    return (
        <Dialog
              open={open}
              onClose={onClose}
              fullWidth
              maxWidth="sm"
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 3,
                  },
                },
              }}
            >
              <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>Adjust Inventory</DialogTitle>
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
                  <Stack spacing={3} sx={{ mb: 3 }}>
                    <Typography>
                        <strong>Ingredient: </strong>{ingredient?.name}
                    </Typography>
                    <Typography>
                        <strong>Current Inventory: </strong>{ingredient?.currentWeightKg} kg
                    </Typography>
                    <TextField
                      type="number"
                      error={!!weightError}
                      helperText={weightError ? weightError : ""}
                      label="New Weight (kg)"
                      value={currentWeightKg}
                      onChange={handleWeightChange}
                    />
                    <TextField
                      fullWidth
                      label="Reason"
                      value={reason}
                      onChange={handleReasonChange}
                      error={!!reasonError}
                      helperText={reasonError ?? ""}
                    />
                  </Stack>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button type="submit" variant="contained" disabled={submitting}>
                      {submitting ? "Adjusting..." : "Adjust Inventory"}
                    </Button>
                  </Box>
                </form>
                {formError && <Alert severity="error">{formError}</Alert>}
              </DialogContent>
            </Dialog>
    )
}

export default AdjustmentInventoryDialog;