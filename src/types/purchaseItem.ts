export type PurchaseItem = {
  id: string;
  purchaseId: string;
  itemName: string;
  orderUnits: string | null;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  rawIngredientId: string | null;
};