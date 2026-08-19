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
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { RecipeIngredientInput } from "../types/recipeIngredientInput";
import CloseIcon from "@mui/icons-material/Close";
import type { RawIngredient } from "../types/rawIngredient";
import type { Recipe } from "../types/recipe";
import type { IngredientError } from "../types/ingredientError";
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

type CreateRecipeDialogProps = {
  open: boolean;
  onClose: () => void;
  onRecipeCreated: (recipe: Recipe) => void;
};

function CreateRecipeDialog({
  open,
  onClose,
  onRecipeCreated,
}: CreateRecipeDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState<string>("");
  const [servings, setServings] = useState<string>("");
  const [rawIngredients, setRawIngredients] = useState<RawIngredient[]>([]);
  const [rawIngredientsLoading, setRawIngredientsLoading] = useState(true);
  const [nameError, setNameError] = useState<string | null>(null);
  const [servingsError, setServingsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredientInput[]>([
    {
      rawIngredientId: "",
      quantity: "",
    },
  ]);
  const [ingredientErrors, setIngredientErrors] = useState<IngredientError[]>(
    [],
  );

  useEffect(() => {
    const fetchRawIngredientsData = async () => {
      try {
        const response = await apiFetch("/api/raw-ingredients");
        if (!response.ok) {
          throw new Error(t("common.errors.networkError"));
        }
        const data = await response.json();
        setRawIngredients(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(t("recipes.form.errors.ingredientsLoadFailed"));
        }
      } finally {
        setRawIngredientsLoading(false);
      }
    };

    fetchRawIngredientsData();
  }, [t]);

  const handleAddIngredientClick = () => {
    setIngredients((previousIngredients) => [
      ...previousIngredients,
      {
        rawIngredientId: "",
        quantity: "",
      },
    ]);
  };

  const handleRemoveIngredientClick = (indexToRemove) => {
    const filteredIngredients = ingredients.filter(
      (_, index) => index !== indexToRemove,
    );
    setIngredients(filteredIngredients);
  };

  const handleRawIngredientChange = (index, event) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].rawIngredientId = event.target.value;
    setIngredients(updatedIngredients);
  };

  const handleQuantityChange = (index, event) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].quantity = event.target.value;
    setIngredients(updatedIngredients);
  };

  const handleNameChange = (event) => {
    setNameError(null);
    setName(event.target.value);
  };

  const handleServingsChange = (event) => {
    setServings(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const servingsNum = Number(servings);
    setNameError(null);
    setServingsError(null);
    setFormError(null);
    if (!trimmedName) {
      setNameError(t("recipes.form.errors.nameRequired"));
      return;
    }
    if (Number.isNaN(servingsNum) || servingsNum <= 0) {
      setServingsError(t("recipes.form.errors.servingsPositive"));
      return;
    }

    const newErrors = [
      {
        rawIngredientId: null,
        quantity: null,
      },
    ];
    let hasErrors = false;
    for (const i in ingredients) {
      newErrors[i] = {
        rawIngredientId: null,
        quantity: null,
      };
      const trimmedIngredientId = ingredients[i].rawIngredientId.trim();
      const quantityNum  = Number(ingredients[i].quantity);
      if (!trimmedIngredientId) {
        newErrors[i].rawIngredientId =
          t("recipes.form.errors.ingredientRequired");
        hasErrors = true;
      }
      if (Number.isNaN(quantityNum) || quantityNum <= 0) {
        newErrors[i].quantity =
          t("recipes.form.errors.quantityPositive");
        hasErrors = true;
      }
    }
    if (hasErrors) {
      setIngredientErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const data = {
      name: trimmedName,
      servings: servingsNum,
      ingredients: ingredients.map((ingredient) => ({
      rawIngredientId: ingredient.rawIngredientId,
      quantity: Number(ingredient.quantity),
      })),
    };
    try {
      const response = await apiFetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("recipes.form.errors.createFailed"));
      }
      const createdRecipe = await response.json();

      onRecipeCreated(createdRecipe);
      onClose();
      setName("");
      setServings("");
      setIngredients([
        {
          rawIngredientId: "",
          quantity: "",
        },
      ]);
      setIngredientErrors([]);
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(t("recipes.form.errors.createFailed"));
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
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>{t("recipes.form.newRecipe")}</DialogTitle>
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              mb: 4,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {t("recipes.form.recipeInformation")}
            </Typography>
            <Stack direction="row" spacing={3}>
              <TextField
                error={!!nameError}
                helperText={nameError ? nameError : ""}
                label={t("recipes.form.name")}
                value={name}
                onChange={handleNameChange}
              />
              <TextField
                error={!!servingsError}
                helperText={servingsError ? servingsError : ""}
                label={t("recipes.form.servings")}
                value={servings}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">{t("recipes.form.servingsUnit")}</InputAdornment>
                    ),
                  },
                }}
                onChange={handleServingsChange}
              />
            </Stack>
          </Box>
          {ingredients.map((ingredient, index) => {
            const selectedRawIngredient = rawIngredients.find(
              (rawIngredient) =>
                rawIngredient.id === ingredient.rawIngredientId
            );

            return (
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {t("recipes.form.item")} {index + 1}
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                useFlexGap
                sx={{
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                <FormControl
                  error={!!ingredientErrors[index]?.rawIngredientId}
                  sx={{ minWidth: 200 }}
                >
                  <InputLabel id={`raw-ingredient-select-label-${index}`}>
                    {t("recipes.form.rawIngredient")}
                  </InputLabel>
                  <Select
                    disabled={rawIngredientsLoading}
                    value={ingredient?.rawIngredientId}
                    label={t("recipes.form.rawIngredient")}
                    labelId={`raw-ingredient-select-label-${index}`}
                    onChange={(event) =>
                      handleRawIngredientChange(index, event)
                    }
                    sx={{ flex: 1, minWidth: 160 }}
                  >
                    {rawIngredients.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!ingredientErrors[index] && (
                    <FormHelperText>
                      {ingredientErrors[index]?.rawIngredientId}
                    </FormHelperText>
                  )}
                </FormControl>
                <TextField
                  type="number"
                  error={!!ingredientErrors[index]?.quantity}
                  helperText={ingredientErrors[index]?.quantity ?? ""}
                  value={ingredient.quantity}
                  onChange={(event) =>
                    handleQuantityChange(index, event)
                  }
                  label={t("recipes.form.quantity")}
                  slotProps={{
                    htmlInput: {
                      step: "any",
                    },
                    input: {
                      endAdornment: selectedRawIngredient ? (
                        <InputAdornment position="end">
                          {formatUnit(selectedRawIngredient.canonicalUnit)}
                        </InputAdornment>
                      ) : undefined,
                    },
                  }}
                  sx={{ flex: 1, minWidth: 160 }}
                />
                {ingredients.length > 1 && (
                  <Button
                    color="error"
                    type="button"
                    onClick={() => handleRemoveIngredientClick(index)}
                  >
                    {t("recipes.form.remove")}
                  </Button>
                )}
              </Stack>
            </Box>
            );
          })}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button type="button" onClick={handleAddIngredientClick} disabled={rawIngredientsLoading}>
              + {t("recipes.form.addIngredient")}
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ alignItems: "flex-end" }}
            >
              {submitting ? t("recipes.form.creating") : t("recipes.form.createRecipe")}
            </Button>
          </Box>
        </form>
        {formError && <Alert severity="error">{formError}</Alert>}
      </DialogContent>
    </Dialog>
  );
}

export default CreateRecipeDialog;
