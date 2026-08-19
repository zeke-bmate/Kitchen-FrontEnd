import { useEffect, useState } from "react";
import type { Supplier } from "../types/supplier";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import apiFetch from "../api/apiFetch";
import SupplierPurchaseHistoryDialog from "../components/SupplierPurchaseHistoryDialog";
import PurchaseDetailsDialog from "../components/PurchaseDetailsDialog";
import type { Purchase } from "../types/purchase";
import { useTranslation } from "react-i18next";

function SuppliersPage() {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [purchaseHistoryOpen, setPurchaseHistoryOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchaseDetailsOpen, setPurchaseDetailsOpen] = useState(false);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameError(null);
    setName(event.target.value);
  };

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPurchaseHistoryOpen(true);
  };
  
  const handlePurchaseHistoryClose = () => {
    setPurchaseHistoryOpen(false);
    setSelectedSupplier(null);
  };
  
  const handlePurchaseClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setPurchaseDetailsOpen(true);
  };
  
  const handlePurchaseDetailsClose = () => {
    setPurchaseDetailsOpen(false);
    setSelectedPurchase(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    setNameError(null);
    setFormError(null);
    if (!trimmedName) {
      setNameError(t("suppliers.errors.nameRequired"));
      return;
    }
    setSubmitting(true);
    const data = { name: trimmedName };
    try {
      const response = await apiFetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("suppliers.errors.createFailed"));
      }

      const createdSupplier = await response.json();

      setSuppliers((previousSuppliers) => [
        createdSupplier,
        ...previousSuppliers,
      ]);
      setName("");
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(t("suppliers.errors.createFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchSuppliersData = async () => {
      try {
        const response = await apiFetch("/api/suppliers");
        if (!response.ok) {
          throw new Error(t("common.errors.networkError"));
        }
        const data = await response.json();
        setSuppliers(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(t("suppliers.errors.loadFailed"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliersData();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <Box sx={{ padding: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {t("suppliers.title")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {t("suppliers.subtitle")}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack direction="row" spacing={5} sx={{ mb: 3 }}>
          <TextField
            error={!!nameError}
            helperText={nameError ? nameError : ""}
            label={t("suppliers.name")}
            value={name}
            onChange={handleNameChange}
          />
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? t("suppliers.adding") : t("suppliers.addSupplier")}
          </Button>
        </Stack>
      </form>
      {formError && <Alert severity="error">{formError}</Alert>}
      {isLoading ? (
        <Typography>{t("suppliers.loading")}</Typography>
      ) : suppliers.length === 0 ? (
        <Typography>{t("suppliers.empty")}</Typography>
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
                  {t("suppliers.name")}
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
                  {t("suppliers.createdAt")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow
                  key={s.id}
                  hover
                  onClick={() => handleSupplierClick(s)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell
                    align="center"
                    sx={{ borderRight: "1px solid #e0e0e0" }}
                  >
                    {s.name}
                  </TableCell>
                  <TableCell align="center">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedSupplier && (
        <SupplierPurchaseHistoryDialog
          open={purchaseHistoryOpen}
          supplier={selectedSupplier}
          onClose={handlePurchaseHistoryClose}
          onPurchaseClick={handlePurchaseClick}
        />
      )}

      {selectedPurchase && (
        <PurchaseDetailsDialog
          selectedPurchase={selectedPurchase}
          open={purchaseDetailsOpen}
          onClose={handlePurchaseDetailsClose}
        />
      )}
    </Box>
  );
}

export default SuppliersPage;
