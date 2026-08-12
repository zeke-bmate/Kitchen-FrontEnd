import type { MeasurementUnit } from "./measurementUnit";

export type PurchaseItemInput = {
  rawIngredientId?: string;
  newIngredientName?: string;
  canonicalUnit?: MeasurementUnit;
  orderUnits: string;
  quantity: string;
  totalPrice: string;
};