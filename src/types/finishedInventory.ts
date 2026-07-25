import type { Recipe } from "./recipe";

export type FinishedInventory = {
    id: string;
    recipeId: string;
    quantityAvailable: number;
    updatedAt: string;
    recipe: Recipe;
}