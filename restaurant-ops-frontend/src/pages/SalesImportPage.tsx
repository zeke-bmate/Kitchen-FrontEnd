import {
    Alert,
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
  } from "@mui/material";
import { useEffect, useState } from "react";
import type { ImportResult } from "../types/importResult";
import type { PreviewRow } from "../types/previewRow";
import type { Recipe } from "../types/recipe";
import DashboardSection from "../components/DashboardSection";


function SalesImportPage() {

    const [file, setFile] = useState<File | null>(null);
    const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
    const [importResults, setImportResults] = useState<ImportResult[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mappingSelections, setMappingSelections] = useState<Record<string, string>>({});
    const [editingMappings, setEditingMappings] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchRecipes = async () => {
          const response = await fetch("http://localhost:3001/api/recipes");
          const data = await response.json();
          setRecipes(data);
        };
      
        fetchRecipes();
      }, []);

      const handleSaveMapping = async (productName: string, recipeId: string | null) => {      
        if (!recipeId) return;
      
        const response = await fetch("http://localhost:3001/api/sales-import/mappings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            posProductName: productName,
            recipeId,
          }),
        });
      
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || "Failed to save mapping");
          return;
        }
      
        const savedMapping = await response.json();
      
        setPreviewRows((prev) =>
          prev.map((row) =>
            row.productName === productName
              ? {
                  ...row,
                  recipeId: savedMapping.recipeId,
                  recipeName: savedMapping.recipe.name,
                  status: "mapped",
                }
              : row
          )
        );

        setEditingMappings((prev) => ({
            ...prev,
            [productName]: false,
        }));
    };


    const handlePreview = async () => {
        if (!file) return;
      
        setIsPreviewLoading(true);
        setError(null);
        setImportResults([]);
      
        const formData = new FormData();
        formData.append("file", file);
      
        try {
          const response = await fetch("http://localhost:3001/api/sales-import/preview", {
            method: "POST",
            body: formData,
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to preview CSV");
          }
      
          const data = await response.json();
          setPreviewRows(data);
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("Failed to preview CSV");
          }
        } finally {
          setIsPreviewLoading(false);
        }
    };

    const handleConfirmImport = async () => {
        setIsImporting(true);
        setError(null);
      
        try {
          const response = await fetch("http://localhost:3001/api/sales-import/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(previewRows),
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to import sales");
          }
      
          const data = await response.json();
          setImportResults(data);
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("Failed to import sales");
          }
        } finally {
          setIsImporting(false);
        }
    };

    return (
        <Box sx={{ padding: 4, maxWidth: 1000, mx: "auto" }}>
          <DashboardSection />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Sales Import
          </Typography>
      
          <Typography variant="body1" sx={{ mb: 3 }}>
            Upload a HIOPOS CSV file to preview mapped and unmapped sales.
          </Typography>
      
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
      
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="outlined" component="label">
              Select CSV
              <input
                hidden
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Button>
      
            <Button
              variant="contained"
              onClick={handlePreview}
              disabled={!file || isPreviewLoading}
            >
              {isPreviewLoading ? "Previewing..." : "Preview Import"}
            </Button>
          </Stack>
      
          {file && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Selected file: {file.name}
            </Typography>
          )}
      
          {previewRows.length > 0 && (
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Product
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Quantity Sold
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Recipe
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
      
                <TableBody>
                  {previewRows.map((row) => (
                    <TableRow key={row.productName} hover>
                      <TableCell align="center">{row.productName}</TableCell>
                      <TableCell align="center">{row.quantitySold}</TableCell>
                      <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                          {row.status === "mapped" && !editingMappings[row.productName] ? (
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ justifyContent: "center", alignItems: "center" }}
                            >
                              <Typography>{row.recipeName}</Typography>
                        
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() =>
                                  setEditingMappings((prev) => ({
                                    ...prev,
                                    [row.productName]: true,
                                  }))
                                }
                              >
                                Change
                              </Button>
                            </Stack>
                          ) : (
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ justifyContent: "center", alignItems: "center" }}
                            >
                              <FormControl size="small" sx={{ minWidth: 180 }}>
                                <InputLabel>Recipe</InputLabel>
                                <Select
                                  label="Recipe"
                                  value={mappingSelections[row.productName] ?? row.recipeId ?? ""}
                                  onChange={(e) =>
                                    setMappingSelections((prev) => ({
                                      ...prev,
                                      [row.productName]: e.target.value,
                                    }))
                                  }
                                >
                                  {recipes.map((recipe) => (
                                    <MenuItem key={recipe.id} value={recipe.id}>
                                      {recipe.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() =>
                                  handleSaveMapping(
                                    row.productName,
                                    mappingSelections[row.productName] ?? row.recipeId
                                  )
                                }
                                disabled={
                                  !(mappingSelections[row.productName] ?? row.recipeId)
                                }
                              >
                                Save
                              </Button>
                            </Stack>
                          )}
                        </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.status}
                          color={row.status === "mapped" ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {previewRows.length > 0 && importResults.length === 0 && (
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={handleConfirmImport}
              disabled={isImporting}
            >
              {isImporting ? "Importing..." : "Confirm Import"}
            </Button>
          )}

          {importResults.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Import Results
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Product
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Qty Sold
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Recipe
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Inventory Change
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {importResults.map((row) => (
                    <TableRow key={row.productName} hover>
                      <TableCell align="center">{row.productName}</TableCell>
                      <TableCell align="center">{row.quantitySold}</TableCell>
                      <TableCell align="center">{row.recipeName ?? "—"}</TableCell>
                      <TableCell align="center">
                        {row.status === "imported"
                          ? `${row.quantityAvailableBefore} → ${row.quantityAvailableAfter}`
                          : "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.status === "imported" ? "Imported" : row.reason ?? "Skipped"}
                          color={row.status === "imported" ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        </Box>
      );
}

export default SalesImportPage;