import type { RawIngredient } from "./rawIngredient";

export type RecipeIngredient = {
  id: string;
  recipeId: string;
  rawIngredientId: string;
  quantity: number;
  rawIngredient: RawIngredient;
};