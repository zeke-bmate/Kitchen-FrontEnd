import type { MeasurementUnit } from "./measurementUnit";

export type LowStockItem = {
  id: string;
  name: string;
  currentQuantity: number;
  canonicalUnit: MeasurementUnit;
};