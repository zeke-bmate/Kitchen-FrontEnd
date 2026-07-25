import type { RecipeIngredient } from "./recipeIngredient";

export type Recipe = {
    id: string;
    name: string;
    servings: number;
    createdAt: string;
    ingredients: RecipeIngredient[];
}