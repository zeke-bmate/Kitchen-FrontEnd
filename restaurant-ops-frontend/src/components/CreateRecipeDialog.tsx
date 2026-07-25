import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { RecipeIngredientInput } from "../types/recipeIngredientInput";
import CloseIcon from '@mui/icons-material/Close';
import type { RawIngredient } from "../types/rawIngredient";
import type { Recipe } from "../types/recipe";
import type { IngredientError } from "../types/ingredientError";

type CreateRecipeDialogProps = {
    open: boolean;
    onClose: () => void;
    onRecipeCreated: (recipe: Recipe) => void;
}

function CreateRecipeDialog({
    open,
    onClose,
    onRecipeCreated,
}: CreateRecipeDialogProps) {

    const [name, setName] = useState<string>("");
    const [servings, setServings] = useState<string>("");
    const [rawIngredients, setRawIngredients] = useState<RawIngredient[]>([]);
    const [rawIngredientsLoading, setRawIngredientsLoading] = useState(true);
    const [nameError, setNameError] = useState<string | null>(null);
    const [servingsError, setServingsError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ingredients, setIngredients] = useState<RecipeIngredientInput[]>([{
        rawIngredientId: "",
        weightKg: 0
      }]);
    const [ingredientErrors, setIngredientErrors] = useState<IngredientError[]>([]);

    useEffect(() => {
        const fetchRawIngredientsData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/raw-ingredients');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRawIngredients(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load Raw Ingredient Data");
                }
            } finally {
                setRawIngredientsLoading(false);
            }
        }

        fetchRawIngredientsData();
    }, []);

    const handleAddIngredientClick = () => {
        setIngredients(previousIngredients => [...previousIngredients, {
            rawIngredientId: "",
            weightKg: 0
        }]);
    }

    const handleRemoveIngredientClick = (indexToRemove) => {
        const filteredIngredients = ingredients.filter((_, index) => index !== indexToRemove);
        setIngredients(filteredIngredients);
    }

    const handleRawIngredientChange = (index, event) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index].rawIngredientId = event.target.value;
        setIngredients(updatedIngredients);
    }

    const handleWeightChange = (index, event) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index].weightKg = Number(event.target.value);
        setIngredients(updatedIngredients);
    }

    const handleNameChange = (event) => {
        setNameError(null);
        setName(event.target.value);
    }

    const handleServingsChange = (event) => {
        setServings(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedName = name.trim();
        const servingsNum = Number(servings);
        setNameError(null);
        setServingsError(null);
        setFormError(null);
        if (!trimmedName) {
            setNameError("Recipe name must be a non empty string.");
            return;
        }
        if (Number.isNaN(servingsNum) || servingsNum <= 0) {
            setServingsError("Servings must be a positive number greater than zero.");
            return;
        }
        
        const newErrors = [{
            rawIngredientId: null,
            weightKg: null
        }]
        let hasErrors = false;
        for (const i in ingredients) {
            newErrors[i] = {
                rawIngredientId: null,
                weightKg: null
            }
            const trimmedIngredientId = ingredients[i].rawIngredientId.trim();
            const weightKgNum = Number(ingredients[i].weightKg);
            if (!trimmedIngredientId) {
                newErrors[i].rawIngredientId = "Raw Ingredient ID must be a non empty string."
                hasErrors = true;
            }
            if (Number.isNaN(weightKgNum) || weightKgNum <= 0) {
                newErrors[i].weightKg = "Weight Kg must be a positive number greater than zero."
                hasErrors = true;
            }
        }
        if (hasErrors) {
            setIngredientErrors(newErrors);
            return;
        }

        setSubmitting(true);
        const data = { name: trimmedName, servings: servingsNum, ingredients: ingredients }
        try {
            const response = await fetch('http://localhost:3001/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create recipe");
            } 
        const createdRecipe = await response.json();
    
        onRecipeCreated(createdRecipe);
        onClose();
        setName("");
        setServings("");
        setIngredients([
            {
                rawIngredientId: "",
                weightKg: 0
            }
        ]);
        setIngredientErrors([]);
        } catch (error) {
            if (error instanceof Error) {
                setFormError(error.message);
            } else {
                setFormError("Failed to create recipe.");
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
            <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>New Recipe</DialogTitle>
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
                            Purchase Information
                        </Typography>
                        <Stack direction="row" spacing={3}>
                        <TextField
                          error={!!nameError}
                          helperText={nameError ? nameError : ""} 
                          label="Name"
                          value={name}
                          onChange={handleNameChange}
                        />
                        <TextField
                          error={!!servingsError}
                          helperText={servingsError ? servingsError : ""} 
                          label="Servings"
                          value={servings}
                          slotProps={{
                            input: {
                              endAdornment: <InputAdornment position="end">servings</InputAdornment>,
                            },
                          }}
                          onChange={handleServingsChange}
                        />
                        </Stack>
                    </Box>
                        {ingredients.map((ingredient, index) => (
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
                                    Item {index + 1}
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
                                <FormControl error={!!ingredientErrors[index]?.rawIngredientId} sx={{ minWidth: 200 }}>
                                <InputLabel id="raw-ingredient-select-label">Raw Ingredient</InputLabel>
                                <Select
                                    value={ingredient?.rawIngredientId}
                                    label="Raw Ingredient"
                                    labelId="raw-ingredient-select-label"
                                    onChange={(event) => handleRawIngredientChange(index, event)}
                                    sx={{ flex: 1, minWidth: 160 }}
                                >
                                    {rawIngredients.map((r) => (
                                        <MenuItem key={r.id} value={r.id}>
                                            {r.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {!!ingredientErrors[index] && <FormHelperText>{ingredientErrors[index]?.rawIngredientId}</FormHelperText>}
                                </FormControl>
                                <TextField
                                    type="Number"
                                    error={!!ingredientErrors[index]?.weightKg}
                                    helperText={ingredientErrors[index]?.weightKg ? ingredientErrors[index]?.weightKg : ""}
                                    value={ingredient.weightKg}
                                    onChange={(event) => handleWeightChange(index, event)}
                                    label="Weight"
                                    slotProps={{
                                        input: {
                                          endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                                        },
                                      }}
                                    sx={{ flex: 1, minWidth: 160 }}
                                />
                                {ingredients.length > 1 && <Button color="error" type="button" onClick={() => handleRemoveIngredientClick(index)}>
                                    Remove
                                </Button>}
                                
                            </Stack>
                            </Box>
                        ))}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button
                                type="button"
                                onClick={handleAddIngredientClick}
                            >
                                + Add Ingredient
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>             
                            <Button type='submit' variant="contained" disabled={submitting} sx={{alignItems:'flex-end'}}>
                                {submitting ? "Creating..." : "Create Recipe"}
                            </Button>
                        </Box> 
                    </form>
                {formError && <Alert severity="error">{formError}</Alert>}
                </DialogContent>
        </Dialog>
    )
}

export default CreateRecipeDialog;