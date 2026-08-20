import type { RawIngredient } from "./rawIngredient";
import type { SupplyItem } from "./supplyItem";

export type PurchaseItem = {
  id: string;
  purchaseId: string;
  itemName: string;
  orderUnits: string | null;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;

  rawIngredientId: string | null;
  supplyItemId: string | null;

  rawIngredient: RawIngredient | null;
  supplyItem: SupplyItem | null;
};