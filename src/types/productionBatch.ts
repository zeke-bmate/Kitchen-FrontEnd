import type { Recipe } from "./recipe";

export type ProductionBatch = {
    id: string;
    recipeId: string;
    quantityProduced: number;
    createdAt: string;
    recipe: Recipe;
}