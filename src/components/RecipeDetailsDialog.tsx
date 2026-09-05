import { Dialog, DialogTitle, DialogContent, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, Stack, Alert, CircularProgress } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from "react";
import apiFetch from "../api/apiFetch";
import type { RecipeCost } from "../types/recipeCost";
import { useTranslation } from "react-i18next";
import useAuth from "../context/useAuth";
import type { RecipeIngredient } from "../types/recipeIngredient";

function RecipeDetailsDialog({
    selectedRecipe,
    open,
    onClose,
}) {
  const { t } = useTranslation();
  const [recipeCost, setRecipeCost] = useState<RecipeCost | null>(null);
  const [isCostLoading, setIsCostLoading] = useState(false);
  const [costError, setCostError] = useState<string | null>(null);
  const { user } = useAuth();

  const canViewRecipeCost = user?.permissions.includes("recipes.view_cost") ?? false;

  useEffect(() => {
  if (!open || !selectedRecipe || !canViewRecipeCost) {
    setRecipeCost(null);
    setCostError(null);
    setIsCostLoading(false);
    return;
  }

  const fetchRecipeCost = async () => {
      setIsCostLoading(true);
      setCostError(null);
      setRecipeCost(null);
  
      try {
        const response = await apiFetch(
          `/api/recipes/${selectedRecipe.id}/cost`
        );
  
        if (!response.ok) {
          const errorData = await response.json();
  
          throw new Error(
            errorData.error ||
              t("recipes.errors.costLoadFailed")
          );
        }
  
        const data: RecipeCost = await response.json();
  
        setRecipeCost(data);
      } catch (error) {
        if (error instanceof Error) {
          setCostError(error.message);
        } else {
          setCostError(t("recipes.errors.costLoadFailed"));
        }
      } finally {
        setIsCostLoading(false);
      }
    };
  
    fetchRecipeCost();
  }, [open, selectedRecipe, canViewRecipeCost, t]);

    return (
        <Dialog 
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            slotProps={{
              paper: {
                sx: { borderRadius: 3 },
              },
            }}
        >
        <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>{selectedRecipe?.name} {t("recipes.details.titleSuffix")}</DialogTitle>
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
          {selectedRecipe && (
            <div>
                <Stack direction="row" sx={{ justifyContent:'space-between', alignItems:'center'}}>
                    <Box
                        sx={{
                            mb: 3,
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                          }}
                        >
                        <Typography sx={{ mb: 1 }}>
                          <strong>{t("recipes.details.servings")}:</strong>{" "}
                          {selectedRecipe.servings}
                        </Typography>
                        {canViewRecipeCost && (
                          <>
                            {isCostLoading ? (
                              <CircularProgress size={22} />
                            ) : recipeCost ? (
                              <>
                                <Typography sx={{ mb: 1 }}>
                                  <strong>{t("recipes.details.totalCost")}:</strong>{" "}
                                  {recipeCost.totalCost === null
                                    ? "—"
                                    : `₡${recipeCost.totalCost.toFixed(2)}`}
                                </Typography>
                                  
                                <Typography>
                                  <strong>{t("recipes.details.costPerServing")}:</strong>{" "}
                                  {recipeCost.costPerServing === null
                                    ? "—"
                                    : `₡${recipeCost.costPerServing.toFixed(2)}`}
                                </Typography>
                              </>
                            ) : null}
                          </>
                        )}
                    </Box>
                    
                </Stack>

                {canViewRecipeCost && recipeCost?.hasMissingCostData && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {t("recipes.details.missingCostWarning")}
                  </Alert>
                )}

                {canViewRecipeCost && costError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {costError}
                  </Alert>
                )}

                {selectedRecipe && (
                  <TableContainer
                    component={Paper}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
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
                            {t("recipes.details.ingredient")}
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
                            {t("recipes.details.quantity")}
                          </TableCell>
                          
                          {canViewRecipeCost && (
                            <>
                              <TableCell
                                align="center"
                                sx={{
                                  color: "white",
                                  fontWeight: 700,
                                  backgroundColor: "primary.main",
                                  borderBottom: "1px solid #e0e0e0",
                                }}
                              >
                                {t("recipes.details.pricePerUnit")}
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
                                {t("recipes.details.cost")}
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
                                {t("recipes.details.latestPurchase")}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      </TableHead>
                          
                      <TableBody>
                        {selectedRecipe.ingredients.map((ingredient: RecipeIngredient) => {
                          const costIngredient = recipeCost?.ingredients.find(
                            (costItem) =>
                              costItem.rawIngredientId === ingredient.rawIngredientId
                          );
                        
                          return (
                            <TableRow key={ingredient.id}>
                              <TableCell align="center">
                                {ingredient.rawIngredient.name}
                              </TableCell>
                          
                              <TableCell align="center">
                                {ingredient.quantity.toFixed(2)}{" "}
                                {t(`units.${ingredient.rawIngredient.canonicalUnit}`)}
                              </TableCell>
                          
                              {canViewRecipeCost && (
                                <>
                                  <TableCell align="center">
                                    {costIngredient?.pricePerUnit == null
                                      ? "—"
                                      : `₡${costIngredient.pricePerUnit.toFixed(2)}`}
                                  </TableCell>
                                    
                                  <TableCell align="center">
                                    {costIngredient?.cost == null
                                      ? "—"
                                      : `₡${costIngredient.cost.toFixed(2)}`}
                                  </TableCell>
                                    
                                  <TableCell align="center">
                                    {costIngredient?.latestPurchaseDate
                                      ? new Date(
                                          costIngredient.latestPurchaseDate
                                        ).toLocaleDateString()
                                      : "—"}
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

            </div>
          )}
        </DialogContent>
      </Dialog>
    )
}

export default RecipeDetailsDialog;