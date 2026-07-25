export type PreviewRow = {
    productName: string;
    quantitySold: number;
    recipeId: string | null;
    recipeName: string | null;
    status: "mapped" | "unmapped";
  };