import { useState, useEffect } from "react";
import type { DashboardMetrics } from "../types/dashboardMetrics";
import { Stack, Typography, Alert, Card, CardContent } from "@mui/material";
import LowStockTable from "./LowStockTable";
import RecentImportTable from "./RecentImportsTable";


function DashboardSection() {

    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/dashboard');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data  = await response.json();
            setMetrics(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load Metrics Data");
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchMetrics();
    }, []);

    return (
        <Stack sx={{ mb: 4 }}>
            {isLoading ? (
                <Typography>Loading...</Typography>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : !metrics ? null : (
              <Stack spacing={4}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    flexWrap: "wrap",
                  }}
                >
                  <Card sx={{ flex: 1, minWidth: 200, borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Available Servings
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {metrics.availableServings}
                      </Typography>
                    </CardContent>
                  </Card>
              
                  <Card sx={{ flex: 1, minWidth: 200, borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Finished Products
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {metrics.finishedProducts}
                      </Typography>
                    </CardContent>
                  </Card>
              
                  <Card sx={{ flex: 1, minWidth: 200, borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Low Stock Ingredients
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {metrics.lowStockIngredients}
                      </Typography>
                    </CardContent>
                  </Card>
              
                  <Card sx={{ flex: 1, minWidth: 200, borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Recipes
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {metrics.numRecipes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              
                <LowStockTable lowStockItems={metrics.lowStockItems}/>
                <RecentImportTable recentImports={metrics.recentImports} />
              </Stack>
            )}
        </Stack>
    )
}

export default DashboardSection;