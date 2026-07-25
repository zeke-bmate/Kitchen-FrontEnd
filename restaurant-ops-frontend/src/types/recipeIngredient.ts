import type { RawIngredient } from "./rawIngredient";

export type RecipeIngredient = {
    id: string;
    recipeId: string;
    rawIngredientId: string;
    weightKg: number;
    rawIngredient: RawIngredient;
}