import type { Recipe } from "./recipe";

export type Order = {
    id: string;
    quantity: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    recipeId: string | null;
    recipe: Recipe | null;
}

export type OrderStatus =
  | "CREATED"
  | "PENDING"
  | "DONE"
  | "DELIVERY"
  | "FINISHED";

  export type OrderStatusLog = {
  id: string;
  orderId: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  createdAt: string;
};

export type OrderDetails = Order & {
  statusLogs: OrderStatusLog[];
};