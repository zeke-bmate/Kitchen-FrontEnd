export type PurchaseItemError = {
  itemName: string | null;
  orderUnits: string | null;
  quantity: string | null;
  subtotal: string | null;
  taxRate: string | null;
  canonicalUnit: string | null;
};