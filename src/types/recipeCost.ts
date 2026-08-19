import type { MeasurementUnit } from "./measurementUnit";

export type RecipeCostIngredient = {
  rawIngredientId: string;
  name: string;
  quantity: number;
  canonicalUnit: MeasurementUnit;
  pricePerUnit: number | null;
  cost: number | null;
  latestPurchaseDate: string | null;
  purchaseId: string | null;
};

export type RecipeCost = {
  recipeId: string;
  recipeName: string;
  servings: number;
  totalCost: number | null;
  costPerServing: number | null;
  hasMissingCostData: boolean;
  ingredients: RecipeCostIngredient[];
};