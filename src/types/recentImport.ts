export type RecentImport = {
    id: string;
    importedAt: string;
    posProductName: string;
    quantitySold: number;
    recipe: {
        name: string;
    };
};