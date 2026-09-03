import type { Supplier } from "./supplier";
import type { PurchaseItem } from "./purchaseItem";

export type Purchase = {
  id: string;
  date: string;

  subtotal?: number;
  taxAmount?: number;
  totalPrice?: number;

  supplierId: string;
  supplier: Supplier;
  items: PurchaseItem[];

  createdAt: string;
};