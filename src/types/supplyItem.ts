import type { MeasurementUnit } from "./measurementUnit";

export type SupplyItem = {
  id: string;
  name: string;
  currentQuantity: number;
  canonicalUnit: MeasurementUnit;
  createdAt: string;
};