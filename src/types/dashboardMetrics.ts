import type { LowStockItem } from "./lowStockItem";
import type { RecentImport } from "./recentImport";

export type DashboardMetrics = {
    availableServings: number;
    finishedProducts: number;
    lowStockIngredients: number;
    numRecipes: number;
    lowStockItems: LowStockItem[];
    recentImports: RecentImport[];
};

