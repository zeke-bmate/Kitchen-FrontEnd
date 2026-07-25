export type ImportResult = {
    productName: string;
    quantitySold: number;
    status: "imported" | "skipped";
    reason?: string;
    recipeId?: string;
    recipeName?: string;
    quantityAvailableBefore?: number;
    quantityAvailableAfter?: number;
  };
  