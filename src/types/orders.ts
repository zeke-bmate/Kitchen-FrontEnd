import type { Recipe } from "./recipe";

export type Order = {
  id: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  recipeId: string;
  location: OrderLocation | null;
  recipe: Recipe;
};

export type OrderLocation =
  | "DEE_PLACE"
  | "ECHO_POKER"
  | "ECHO_EVENTS";

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