import type { RawIngredient } from "../types/rawIngredient.ts";
import { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import {
  Alert,
  Button,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
} from "@mui/material";
import apiFetch from "../api/apiFetch.ts";
import AdjustmentInventoryDialog from "../components/AdjustmentInventoryDialog.tsx";
import InventoryHistoryDialog from "../components/InventoryHistoryDialog.tsx";
import type { MeasurementUnit } from "../types/measurementUnit";

const formatUnit = (unit: MeasurementUnit) => {
  switch (unit) {
    case "KG":
      return "kg";
    case "L":
      return "L";
    case "EACH":
      return "each";
    case "BUNCH":
      return "bunch";
    case "HEAD":
      return "head";
  }
};

function RawIngredientsPage() {
  const [ingredients, setIngredients] = useState<RawIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState<string>("");
  const [canonicalUnit, setCanonicalUnit] = useState<MeasurementUnit>("KG");
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<RawIngredient | null>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [historyIngredient, setHistoryIngredient] = useState<RawIngredient | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleQuantityChange = (event) => { 
    setCurrentQuantity(event.target.value); 
  }

  const handleUnitChange = (event) => {
    setCanonicalUnit(event.target.value as MeasurementUnit);
  };

  const handleOpenHistoryDialog = (
    ingredient: RawIngredient
  ) => {
    setHistoryIngredient(ingredient);
    setHistoryDialogOpen(true);
  };
  
  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setHistoryIngredient(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const currentQuantityNum = Number(currentQuantity);
    setNameError(null);
    setQuantityError(null);
    setFormError(null);
    if (!trimmedName) {
      setNameError("Name must be a non empty string.");
      return;
    }
    if (
      Number.isNaN(currentQuantityNum) ||
      currentQuantityNum < 0
    ) {
      setQuantityError(
        "Current quantity must be a non-negative number."
      );
      return;
    }
    setSubmitting(true);
    const data = {
      name: trimmedName,
      currentQuantity: currentQuantityNum,
      canonicalUnit,
    };
    try {
      const response = await apiFetch("/api/raw-ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create raw ingredient");
      }

      const createdIngredient = await response.json();

      setIngredients((previousIngredients) => [
        ...previousIngredients,
        createdIngredient,
      ]);
      setName("");
      setCurrentQuantity("");
      setCanonicalUnit("KG");
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Failed to create production batch.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAdjustDialog = (
    ingredient: RawIngredient
  ) => {
    setSelectedIngredient(ingredient);
    setAdjustDialogOpen(true);
  };
  
  const handleCloseAdjustDialog = () => {
    setAdjustDialogOpen(false);
    setSelectedIngredient(null);
  };
  
  const handleInventoryUpdated = (
    updatedIngredient: RawIngredient
  ) => {
    setIngredients((previousIngredients) =>
      previousIngredients.map((ingredient) =>
        ingredient.id === updatedIngredient.id
          ? updatedIngredient
          : ingredient
      )
    );
  
    setAdjustDialogOpen(false);
    setSelectedIngredient(null);
  };

  useEffect(() => {
    const fetchIngredientsData = async () => {
      try {
        const response = await apiFetch("/api/raw-ingredients");
        if (!response.ok) {
          const errorData = await response.json();
                
          throw new Error(
            errorData.error ||
            errorData.message ||
            "Request failed.",
          );
        }
        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load Ingredients Data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredientsData();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <Box sx={{ padding: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Raw Ingredients
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Track current raw inventory by canonical unit.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
          <TextField
            error={!!nameError}
            helperText={nameError ? nameError : ""}
            label="Name"
            value={name}
            onChange={handleNameChange}
          />
          <TextField
            type="number"
            error={!!quantityError}
            helperText={quantityError ?? ""}
            label="Quantity"
            value={currentQuantity}
            onChange={handleQuantityChange}
            slotProps={{
              htmlInput: {
                step: "any",
              },
            }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="unit-select-label">
              Unit
            </InputLabel>

            <Select
              labelId="unit-select-label"
              value={canonicalUnit}
              label="Unit"
              onChange={handleUnitChange}
            >
              <MenuItem value="KG">kg</MenuItem>
              <MenuItem value="L">L</MenuItem>
              <MenuItem value="EACH">each</MenuItem>
              <MenuItem value="BUNCH">bunch</MenuItem>
              <MenuItem value="HEAD">head</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Adding..." : "Submit"}
          </Button>
        </Stack>
      </form>
      {formError && <Alert severity="error">{formError}</Alert>}
      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : ingredients.length === 0 ? (
        <Typography>No ingredients found.</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, overflow: "hidden" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    backgroundColor: "primary.main",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    backgroundColor: "primary.main",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  Current Quantity
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    backgroundColor: "primary.main",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  Created At
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    backgroundColor: "primary.main",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredients.map((i) => (
                <TableRow 
                  key={i.id}
                  hover
                  onClick={() => handleOpenHistoryDialog(i)}
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {i.name}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {i.currentQuantity.toFixed(2)} {formatUnit(i.canonicalUnit)}
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {new Date(i.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenAdjustDialog(i);
                      }}
                    >
                      Adjust
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {selectedIngredient && (
        <AdjustmentInventoryDialog
          open={adjustDialogOpen}
          ingredient={selectedIngredient}
          onClose={handleCloseAdjustDialog}
          onInventoryUpdated={handleInventoryUpdated}
        />
      )}

      <InventoryHistoryDialog
        open={historyDialogOpen}
        ingredient={historyIngredient}
        onClose={handleCloseHistoryDialog}
      />
    </Box>
  );
}

export default RawIngredientsPage;
