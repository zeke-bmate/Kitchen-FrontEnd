export type InventoryTransactionType =
  | "PURCHASE"
  | "PRODUCTION"
  | "ADJUSTMENT"
  | "WASTE"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export type InventoryTransaction = {
  id: string;
  rawIngredientId: string;
  type: InventoryTransactionType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string | null;
  purchaseId: string | null;
  productionBatchId: string | null;
  inventoryTransferId: string | null;
  createdAt: string;

  purchase: {
    id: string;
    date: string;
    totalPrice: number;
    supplierId: string;
    createdAt: string;
    supplier: {
      id: string;
      name: string;
      createdAt: string;
    };
  } | null;

  productionBatch: {
    id: string;
    recipeId: string;
    quantityProduced: number;
    createdAt: string;
    orderId: string | null;
    recipe: {
      id: string;
      name: string;
      servings: number;
      createdAt: string;
    };
  } | null;

  inventoryTransfer: {
    id: string;
    sourceLocation: string;
    destinationLocation: string;
    createdAt: string;
  } | null;
};