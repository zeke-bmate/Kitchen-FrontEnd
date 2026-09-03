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
import { useTranslation } from "react-i18next";
import type { RawIngredient } from "../types/rawIngredient";
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
  const { t } = useTranslation();

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
        t("ingredients.transferDialog.errors.quantityPositive"),
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
        t("ingredients.transferDialog.errors.exceedsEchoInventory"),
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
            t("ingredients.transferDialog.errors.transferFailed"),
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
        t("ingredients.transferDialog.errors.transferFailed");
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
        {t("ingredients.transferDialog.title")}
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
            <strong>{t("ingredients.transferDialog.ingredient")}:</strong>{" "}
            {ingredient?.name}
          </Typography>

          {ingredient && (
            <Typography>
              <strong>{t("ingredients.transferDialog.echoKitchenInventory")}:</strong>{" "}
              {ingredient.currentQuantity.toFixed(2)}{" "}
              {t(`units.${ingredient.canonicalUnit}`)}
            </Typography>
          )}

          <FormControl fullWidth>
            <InputLabel id="transfer-direction-label">
              {t("ingredients.transferDialog.direction")}
            </InputLabel>

            <Select
              labelId="transfer-direction-label"
              value={direction}
              label={t("ingredients.transferDialog.direction")}
              onChange={(event) =>
                setDirection(
                  event.target.value as TransferDirection,
                )
              }
            >
              <MenuItem value="ECHO_KITCHEN_TO_DEE_PLACE">
                {t("ingredients.transferDialog.directions.echoToDee")}
              </MenuItem>

              <MenuItem value="DEE_PLACE_TO_ECHO_KITCHEN">
                {t("ingredients.transferDialog.directions.deeToEcho")}
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="number"
            label={t("ingredients.transferDialog.quantity")}
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
                    {t(`units.${ingredient.canonicalUnit}`)}
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
                ? t("ingredients.transferDialog.transferring")
                : t("ingredients.transferDialog.submit")}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default TransferInventoryDialog;