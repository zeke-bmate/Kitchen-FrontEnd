import { useEffect, useState } from "react";
import type { Recipe } from "../types/recipe";
import {
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
} from "@mui/material";
import RecipeDetailsDialog from "../components/RecipeDetailsDialog";
import CreateRecipeDialog from "../components/CreateRecipeDialog";
import apiFetch from "../api/apiFetch";
import { useTranslation } from "react-i18next";

function RecipesPage() {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  const handleCreateRecipeClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateRecipeClose = () => {
    setCreateDialogOpen(false);
  };

  const handleRecipeCreated = (createdRecipe) => {
    setRecipes((previousRecipes) => [createdRecipe, ...previousRecipes]);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedRecipe(null);
  };

  useEffect(() => {
    const fetchRecipesData = async () => {
      try {
        const response = await apiFetch("/api/recipes");
        if (!response.ok) {
          throw new Error(t("common.errors.networkError"));
        }
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(t("recipes.errors.loadFailed"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipesData();
  }, [t]);

  if (error) return <p>{error}</p>;

  return (
    <Box sx={{ padding: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {t("recipes.title")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {t("recipes.subtitle")}
      </Typography>
      <Button
        variant="contained"
        onClick={handleCreateRecipeClick}
        sx={{ mb: 3 }}
      >
        {t("recipes.createRecipe")}
      </Button>
      {isLoading ? (
        <Typography>{t("recipes.loading")}</Typography>
      ) : recipes.length === 0 ? (
        <Typography>{t("recipes.empty")}</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, overflow: "hidden" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    backgroundColor: "primary.main",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {t("recipes.table.recipe")}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    backgroundColor: "primary.main",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {t("recipes.table.servings")}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    backgroundColor: "primary.main",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {t("recipes.table.createdAt")}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    backgroundColor: "primary.main",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {t("recipes.table.ingredientCount")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recipes.map((r) => (
                <TableRow
                  key={r.id}
                  sx={{ cursor: "pointer" }}
                  hover
                  onClick={() => handleRecipeClick(r)}
                >
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {r.name}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {r.servings}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">{r.ingredients.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedRecipe && (
        <RecipeDetailsDialog
          selectedRecipe={selectedRecipe}
          open={dialogOpen}
          onClose={handleClose}
        />
      )}
      {createDialogOpen && (
        <CreateRecipeDialog
          open={createDialogOpen}
          onClose={handleCreateRecipeClose}
          onRecipeCreated={handleRecipeCreated}
        />
      )}
    </Box>
  );
}

export default RecipesPage;
