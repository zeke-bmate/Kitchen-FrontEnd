import { useEffect, useState } from "react";
import type { RawIngredient } from "../types/rawIngredient";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import apiFetch from "../api/apiFetch";
import { useTranslation } from "react-i18next";

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
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [quantityError, setQuantityError] =
    useState<string | null>(null);
  const [reasonError, setReasonError] =
    useState<string | null>(null);
  const [formError, setFormError] =
    useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleQuantityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQuantityError(null);
    setCurrentQuantity(event.target.value);
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

    const quantityNumber = Number(currentQuantity);
    const trimmedReason = reason.trim();

    setQuantityError(null);
    setReasonError(null);
    setFormError(null);

    if (
      Number.isNaN(quantityNumber) ||
      quantityNumber < 0
    ) {
      setQuantityError(
        t("ingredients.adjustDialog.errors.quantityInvalid")
      );
      return;
    }

    setSubmitting(true);

    const data = {
      currentQuantity: quantityNumber,
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
          errorData.error || t("ingredients.adjustDialog.errors.adjustFailed"),
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
        setFormError(t("ingredients.adjustDialog.errors.adjustFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (ingredient) {
      setCurrentQuantity(
        String(ingredient.currentQuantity)
      );
      setReason("");
      setQuantityError(null);
      setReasonError(null);
      setFormError(null);
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
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        {t("ingredients.adjustDialog.title")}
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
          <Stack spacing={3} sx={{ mb: 3 }}>
            <Typography>
              <strong>{t("ingredients.adjustDialog.ingredient")}: </strong>
              {ingredient?.name}
            </Typography>

            <Typography>
              <strong>{t("ingredients.adjustDialog.currentInventory")}: </strong>
              {ingredient &&
                `${ingredient.currentQuantity.toFixed(2)} ${t(
                  `units.${ingredient.canonicalUnit}`
                )}`}
            </Typography>

            <TextField
              type="number"
              error={!!quantityError}
              helperText={quantityError ?? ""}
              label={
                ingredient
                  ? t("ingredients.adjustDialog.newQuantityWithUnit", {
                      unit: t(`units.${ingredient.canonicalUnit}`),
                    })
                  : t("ingredients.adjustDialog.newQuantity")
              }
              value={currentQuantity}
              onChange={handleQuantityChange}
              slotProps={{
                htmlInput: {
                  step: "any",
                },
              }}
            />

            <TextField
              fullWidth
              label={t("ingredients.adjustDialog.reason")}
              value={reason}
              onChange={handleReasonChange}
              error={!!reasonError}
              helperText={reasonError ?? ""}
            />
          </Stack>

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
              {submitting
                ? t("ingredients.adjustDialog.adjusting")
                : t("ingredients.adjustDialog.submit")}
            </Button>
          </Box>
        </form>

        {formError && (
          <Alert severity="error">{formError}</Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AdjustmentInventoryDialog;