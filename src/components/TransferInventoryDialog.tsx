import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import type { RawIngredient } from "../types/rawIngredient";
import type { MeasurementUnit } from "../types/measurementUnit";
import apiFetch from "../api/apiFetch";

type TransferDirection =
  | "ECHO_KITCHEN_TO_DEE_PLACE"
  | "DEE_PLACE_TO_ECHO_KITCHEN";

type TransferInventoryDialogProps = {
  open: boolean;
  ingredient: RawIngredient | null;
  onClose: () => void;
  onTransferCreated: (ingredient: RawIngredient) => void;
};

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

function TransferInventoryDialog({
  open,
  ingredient,
  onClose,
  onTransferCreated,
}: TransferInventoryDialogProps) {
  const [direction, setDirection] =
    useState<TransferDirection>(
      "ECHO_KITCHEN_TO_DEE_PLACE",
    );

  const [quantity, setQuantity] = useState("");
  const [quantityError, setQuantityError] =
    useState<string | null>(null);
  const [formError, setFormError] =
    useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!ingredient) {
      return;
    }

    setQuantityError(null);
    setFormError(null);

    const quantityNumber = Number(quantity);

    if (
      Number.isNaN(quantityNumber) ||
      quantityNumber <= 0
    ) {
      setQuantityError(
        "Transfer quantity must be greater than zero.",
      );
      return;
    }

    const sourceLocation =
      direction === "ECHO_KITCHEN_TO_DEE_PLACE"
        ? "ECHO_KITCHEN"
        : "DEE_PLACE";

    const destinationLocation =
      direction === "ECHO_KITCHEN_TO_DEE_PLACE"
        ? "DEE_PLACE"
        : "ECHO_KITCHEN";

    if (
      sourceLocation === "ECHO_KITCHEN" &&
      quantityNumber > ingredient.currentQuantity
    ) {
      setQuantityError(
        "Transfer quantity cannot exceed Echo Kitchen inventory.",
      );
      return;
    }

    const data = {
      sourceLocation,
      destinationLocation,
      items: [
        {
          rawIngredientId: ingredient.id,
          quantity: quantityNumber,
        },
      ],
    };

    setSubmitting(true);

    try {
      const response = await apiFetch(
        "/api/inventory-transfers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error ||
            "Failed to transfer inventory.",
        );
      }

      const createdTransfer = await response.json();

      const updatedIngredient =
        createdTransfer.items[0].rawIngredient;

      onTransferCreated(updatedIngredient);

      setQuantity("");
      setDirection("ECHO_KITCHEN_TO_DEE_PLACE");
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to transfer inventory.");
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
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        Transfer Inventory
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
        <Stack spacing={3}>
          <Typography>
            <strong>Ingredient:</strong>{" "}
            {ingredient?.name}
          </Typography>

          {ingredient && (
            <Typography>
              <strong>Echo Kitchen Inventory:</strong>{" "}
              {ingredient.currentQuantity.toFixed(2)}{" "}
              {formatUnit(ingredient.canonicalUnit)}
            </Typography>
          )}

          <FormControl fullWidth>
            <InputLabel id="transfer-direction-label">
              Direction
            </InputLabel>

            <Select
              labelId="transfer-direction-label"
              value={direction}
              label="Direction"
              onChange={(event) =>
                setDirection(
                  event.target.value as TransferDirection,
                )
              }
            >
              <MenuItem value="ECHO_KITCHEN_TO_DEE_PLACE">
                Echo Kitchen → DeePlace
              </MenuItem>

              <MenuItem value="DEE_PLACE_TO_ECHO_KITCHEN">
                DeePlace → Echo Kitchen
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(event) => {
              setQuantityError(null);
              setQuantity(event.target.value);
            }}
            error={!!quantityError}
            helperText={quantityError ?? ""}
            slotProps={{
              htmlInput: {
                step: "any",
              },
              input: {
                endAdornment: ingredient ? (
                  <InputAdornment position="end">
                    {formatUnit(ingredient.canonicalUnit)}
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />

          {formError && (
            <Alert severity="error">{formError}</Alert>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? "Transferring..."
                : "Transfer"}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default TransferInventoryDialog;