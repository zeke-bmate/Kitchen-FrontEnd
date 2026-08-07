export type PurchaseItemInput = {
  rawIngredientId?: string;
  newIngredientName?: string;
  orderUnits: string;
  weightKg: number;
  pricePerKg: number;
};