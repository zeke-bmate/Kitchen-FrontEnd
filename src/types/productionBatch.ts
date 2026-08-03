import type { Order } from "./orders";
import type { Recipe } from "./recipe";

export type ProductionBatch = {
    id: string;
    recipeId: string;
    quantityProduced: number;
    createdAt: string;
    recipe: Recipe;
    orderId: string | null;
    order: Order | null;
}