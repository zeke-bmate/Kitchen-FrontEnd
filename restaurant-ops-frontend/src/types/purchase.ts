import type { Supplier } from "./supplier";
import type { PurchaseItem } from "./purchaseItem";


export type Purchase = {
    id: string;
    date: string;
    totalPrice: number;
    supplierId: string;
    supplier: Supplier;
    items: PurchaseItem[];
    createdAt: string;
}