import { useState, useEffect } from "react";
import type { Recipe } from "../types/recipe";
import type { ProductionBatch } from "../types/productionBatch";
import Box from "@mui/material/Box";
import { Typography, Stack, TextField, InputAdornment, Button, Alert, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, InputLabel, FormControl, FormHelperText } from "@mui/material";


function ProductionBatchesPage() {

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([])
    const [isRecipeLoading, setIsRecipeLoading] = useState(true);
    const [isProductionLoading, setIsProductionLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
    const [quantityProduced, setQuantityProduced] = useState<string | null>("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [recipeError, setRecipeError] = useState<string | null>(null);
    const [quantityError, setQuantityError] = useState<string | null>(null);

    const handleRecipeChange = (event) => {
        setRecipeError(null);
        setSelectedRecipeId(event.target.value);
    }

    const handleQuantityChange = (event) => {
        setQuantityProduced(event.target.value);
    }

    const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedRecipeId = selectedRecipeId.trim();
        const quantityProducedNum = Number(quantityProduced);
        setRecipeError(null);
        setQuantityError(null);
        setFormError(null);
        if (!trimmedRecipeId) {
            setRecipeError("Recipe ID must be a non empty string.");
            return;
        }
        if (Number.isNaN(quantityProducedNum) || quantityProducedNum <= 0) {
            setQuantityError("Quantity Produced must be a positive number greater than zero.");
            return;
        }
        setSubmitting(true);
        const data = { recipeId: trimmedRecipeId, quantityProduced: quantityProducedNum }
        try {
            const response = await fetch('http://localhost:3001/api/production-batches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create production batch");
            } 
        const createdProductionBatch = await response.json();
    
       
        setProductionBatches(previousProductionBatches => [createdProductionBatch, ...previousProductionBatches]);
        setSelectedRecipeId("");
        setQuantityProduced("");
        } catch (error) {
            if (error instanceof Error) {
                setFormError(error.message);
            } else {
                setFormError("Failed to create production batch.");
            }
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        const fetchRecipesData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/recipes');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data  = await response.json();
            setRecipes(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load Recipe Data");
                }
            } finally {
                setIsRecipeLoading(false);
            }
        }

        fetchRecipesData();
    }, []);

    useEffect(() => {
        const fetchProductionData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/production-batches')
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setProductionBatches(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load Production Batch Data");
                }
            } finally {
                setIsProductionLoading(false);
            }
        }

        fetchProductionData();

    }, []);

    if (error) return <p>{error}</p>

    return (
        <Box sx={{ padding: 4, maxWidth:1000, mx:"auto" }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Production Batches</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>Track production batches by Recipe.</Typography>
            <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={5} sx={{ mb: 3}}>
                <FormControl error={!!recipeError}sx={{ minWidth: 200 }}>
                    <InputLabel id="recipe-select-label">Recipe</InputLabel>
                    <Select 
                        value={selectedRecipeId} 
                        onChange={handleRecipeChange} 
                        label="Recipe" 
                        labelId="recipe-select-label"
                        autoWidth>
                        {recipes.map((r) => (
                            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                        ))}
                    </Select>
                    {!!recipeError && <FormHelperText>{recipeError}</FormHelperText>}
                </FormControl>
                <TextField
                  type="number"
                  error={!!quantityError}
                  label="Batches Produced"
                  value={quantityProduced}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">batches</InputAdornment>,
                    },
                  }}
                  onChange={handleQuantityChange}
                  helperText={
                    quantityError
                      ? quantityError
                      : selectedRecipe
                        ? `Each batch produces ${selectedRecipe.servings} servings.`
                        : "Select a recipe to see servings per batch."
                  }
                />
                <Button type='submit' variant="contained" disabled={submitting}>
                    {submitting ? "Adding..." : "Submit"}
                </Button>
            </Stack>
            </form>
            {formError && <Alert severity="error">{formError}</Alert>}
            {isProductionLoading ?
                <Typography>Loading...</Typography> : productionBatches.length === 0 ?
                <Typography>No production batches found.</Typography> :
            <TableContainer component={Paper} sx={{ borderRadius:3, overflow: 'hidden'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Recipe</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Batches Produced</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Created At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { productionBatches.map((p) => (
                            <TableRow key={p.id} hover>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{p.recipe.name}</TableCell>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{p.quantityProduced}</TableCell>
                                <TableCell align="center">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            }
        </Box>
    )
}

export default ProductionBatchesPage;