import type { MeasurementUnit } from "./measurementUnit";

export type PurchaseItemInput = {
  itemType: "INGREDIENT" | "SUPPLY";

  rawIngredientId?: string;
  newIngredientName?: string;

  supplyItemId?: string;
  newSupplyItemName?: string;

  canonicalUnit?: MeasurementUnit;

  orderUnits: string;
  quantity: string;
  totalPrice: string;
};