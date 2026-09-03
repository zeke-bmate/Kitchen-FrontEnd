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
} from "@mui/material";
import apiFetch from "../api/apiFetch.ts";
import AdjustmentInventoryDialog from "../components/AdjustmentInventoryDialog.tsx";
import InventoryHistoryDialog from "../components/InventoryHistoryDialog.tsx";
import type { MeasurementUnit } from "../types/measurementUnit";
import TransferInventoryDialog from "../components/TransferInventoryDialog.tsx";
import TransferHistoryDialog from "../components/TransferHistoryDialog.tsx";
import useAuth from "../context/useAuth.ts";
import { useTranslation } from "react-i18next";

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
  const [transferIngredient, setTransferIngredient] = useState<RawIngredient | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferHistoryOpen, setTransferHistoryOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  const canAdjustInventory = user?.permissions.includes("inventory.adjust") ?? false;
  const canViewInventoryTransactions = user?.permissions.includes("inventory.transactions.view") ?? false;
  const canViewInventoryTransfers = user?.permissions.includes("inventory.transfer.view") ?? false;
  const canCreateInventoryTransfer = user?.permissions.includes("inventory.transfer.create") ?? false;

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

  const handleOpenTransferDialog = (
    ingredient: RawIngredient
  ) => {
    setTransferIngredient(ingredient);
    setTransferDialogOpen(true);
  };

  const handleCloseTransferDialog = () => {
    setTransferDialogOpen(false);
    setTransferIngredient(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const currentQuantityNum = Number(currentQuantity);
    setNameError(null);
    setQuantityError(null);
    setFormError(null);
    if (!trimmedName) {
      setNameError(t("ingredients.errors.nameRequired"));
      return;
    }
    if (
      Number.isNaN(currentQuantityNum) ||
      currentQuantityNum < 0
    ) {
      setQuantityError(
        t("ingredients.errors.quantityInvalid")
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
        throw new Error(errorData.error || t("ingredients.errors.createFailed"));
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
        setFormError(t("ingredients.errors.createFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferCreated = (
    updatedIngredient: RawIngredient
  ) => {
    setIngredients((previousIngredients) =>
      previousIngredients.map((ingredient) =>
        ingredient.id === updatedIngredient.id
          ? updatedIngredient
          : ingredient
      )
    );
  
    setTransferDialogOpen(false);
    setTransferIngredient(null);
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
            t("common.errors.requestFailed"),
          );
        }
        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(t("ingredients.errors.loadFailed"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredientsData();
  }, [t]);

  if (error) return <p>{error}</p>;

  return (
    <Box sx={{ padding: 4, maxWidth: 1000, mx: "auto" }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t("ingredients.title")}
        </Typography>
        
        {canViewInventoryTransfers && (
          <Button
            variant="outlined"
            onClick={() => setTransferHistoryOpen(true)}
          >
            {t("ingredients.transferHistory.title")}
          </Button>
        )}
      </Stack>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {t("ingredients.subtitle")}
      </Typography>
      {canAdjustInventory && (
        <form onSubmit={handleSubmit}>
          <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
            <TextField
              error={!!nameError}
              helperText={nameError ? nameError : ""}
              label={t("ingredients.form.name")}
              value={name}
              onChange={handleNameChange}
            />
            <TextField
              type="number"
              error={!!quantityError}
              helperText={quantityError ?? ""}
              label={t("ingredients.form.quantity")}
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
                {t("ingredients.form.unit")}
              </InputLabel>

              <Select
                labelId="unit-select-label"
                value={canonicalUnit}
                label={t("ingredients.form.unit")}
                onChange={handleUnitChange}
              >
                <MenuItem value="KG">{t("units.KG")}</MenuItem>
                <MenuItem value="L">{t("units.L")}</MenuItem>
                <MenuItem value="EACH">{t("units.EACH")}</MenuItem>
                <MenuItem value="BUNCH">{t("units.BUNCH")}</MenuItem>
                <MenuItem value="HEAD">{t("units.HEAD")}</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting
                ? t("ingredients.form.adding")
                : t("ingredients.form.submit")}
            </Button>
          </Stack>
        </form>
      )}
      {formError && <Alert severity="error">{formError}</Alert>}
      {isLoading ? (
        <Typography>{t("ingredients.loading")}</Typography>
      ) : ingredients.length === 0 ? (
        <Typography>{t("ingredients.empty")}</Typography>
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
                  {t("ingredients.table.name")}
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
                  {t("ingredients.table.currentQuantity")}
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
                  {t("ingredients.table.createdAt")}
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
                  {t("ingredients.table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredients.map((i) => (
                <TableRow 
                  key={i.id}
                  hover
                  onClick={
                    canViewInventoryTransactions
                      ? () => handleOpenHistoryDialog(i)
                      : undefined
                  }
                  sx={{
                    cursor: canViewInventoryTransactions
                      ? "pointer"
                      : "default",
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
                    {i.currentQuantity.toFixed(2)} {t(`units.${i.canonicalUnit}`)}
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {new Date(i.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "center" }}
                    >
                      {canAdjustInventory && (
                        <Button
                          variant="outlined"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenAdjustDialog(i);
                          }}
                        >
                          {t("ingredients.actions.adjust")}
                        </Button>
                      )}
                      {canCreateInventoryTransfer && (
                        <Button
                          variant="outlined"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenTransferDialog(i);
                          }}
                        >
                          {t("ingredients.actions.transfer")}
                        </Button>
                      )}
                    </Stack>
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

      {transferIngredient && (
        <TransferInventoryDialog
          open={transferDialogOpen}
          ingredient={transferIngredient}
          onClose={handleCloseTransferDialog}
          onTransferCreated={handleTransferCreated}
        />
      )}

      <TransferHistoryDialog
        open={transferHistoryOpen}
        onClose={() => setTransferHistoryOpen(false)}
      />
    </Box>
  );
}

export default RawIngredientsPage;
