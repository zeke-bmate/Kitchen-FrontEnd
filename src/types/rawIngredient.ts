import type { MeasurementUnit } from "./measurementUnit";

export type RawIngredient = {
  id: string;
  name: string;
  currentQuantity: number;
  canonicalUnit: MeasurementUnit;
  createdAt: string;
};