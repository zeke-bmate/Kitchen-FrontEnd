import { useEffect, useState } from "react";
import type { Recipe } from "../types/recipe";
import { Box, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Dialog, DialogContent, DialogTitle, Button } from "@mui/material";
import RecipeDetailsDialog from "../components/RecipeDetailsDialog";
import CreateRecipeDialog from "../components/CreateRecipeDialog";


function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const handleRecipeClick = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setDialogOpen(true);
    }

    const handleCreateRecipeClick = () => {
        setCreateDialogOpen(true);
    }

    const handleCreateRecipeClose = () => {
        setCreateDialogOpen(false);
    }

    const handleRecipeCreated = (createdRecipe) => {
        setRecipes(previousRecipes => [createdRecipe, ...previousRecipes]);
    }

    const handleClose = () => {
        setDialogOpen(false);
        setSelectedRecipe(null);
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
                setIsLoading(false);
            }
        }

        fetchRecipesData();
    }, []);

    if (error) return <p>{error}</p>

    return (
        <Box sx={{ padding: 4, maxWidth:1000, mx:"auto" }}>  
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Recipes</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>Track recipes by servings.</Typography>
            <Button variant="contained" onClick={handleCreateRecipeClick} sx={{ mb: 3 }}>Create Recipe</Button>
            {isLoading ?
                <Typography>Loading...</Typography> : recipes.length === 0 ?
                <Typography>No recipes found.</Typography> :
            <TableContainer component={Paper} sx={{ borderRadius:3, overflow: 'hidden'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Recipe</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Servings</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Created At</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Ingredient Count</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { recipes.map((r) => (
                            <TableRow key={r.id} sx={{ cursor: "pointer" }} hover onClick={() => handleRecipeClick(r)}>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{r.name}</TableCell>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{r.servings}</TableCell>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell align="center">{r.ingredients.length}</TableCell>
                            </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            }

            {selectedRecipe && <RecipeDetailsDialog selectedRecipe={selectedRecipe} open={dialogOpen} onClose={handleClose}/>}
            {createDialogOpen && <CreateRecipeDialog open={createDialogOpen} onClose={handleCreateRecipeClose} onRecipeCreated={handleRecipeCreated}/>}
        </Box>
    )
}

export default RecipesPage;