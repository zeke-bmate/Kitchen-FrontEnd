import { useEffect, useState } from "react";
import type { Purchase } from "../types/purchase";
import type { Supplier } from "../types/supplier";
import type { PurchaseItemInput } from "../types/purchaseItemInput";
import { Box, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import PurchaseDetailsDialog from "../components/PurchaseDetailsDialog";
import CreatePurchaseDialog from "../components/CreatePurchaseDialog";

function PurchasesPage() {

    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [items, setItems] = useState<PurchaseItemInput[]>([]);
    const [date, setDate] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isPurchaseLoading, setIsPurchaseLoading] = useState(true);
    const [isSupplierLoading, setIsSupplierLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const handlePurchaseClick = (purchase: Purchase) => {
        setSelectedPurchase(purchase);
        setDialogOpen(true);
    }

    const handlePurchaseClose = () => {
        setDialogOpen(false);
        setSelectedPurchase(null);
    }

    const handlePurchaseCreated = (createdPurchase) => {
        setPurchases(previousPurchases => [createdPurchase, ... previousPurchases]);
    }

    const handleCreatePurchaseClick = () => {
        setCreateDialogOpen(true);
    }

    const handleCreatePurchaseClose = () => {
        setCreateDialogOpen(false);
    }

    useEffect(() => {
        const fetchPurchasesData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/purchases');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data  = await response.json();
            setPurchases(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load Purchase Data");
                }
            } finally {
                setIsPurchaseLoading(false);
            }
        }

        fetchPurchasesData();
    }, []);
    
    useEffect(() => {
        const fetchSuppliersData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/suppliers');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data  = await response.json();
            setSuppliers(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load supplier Data");
                }
            } finally {
                setIsSupplierLoading(false);
            }
        }

        fetchSuppliersData();
    }, []);

    if (error) return <p>{error}</p>

    return (
        <Box sx={{ padding: 4, maxWidth:1000, mx:"auto" }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Purchases</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>Track purchases by Supplier.</Typography>
            <Button variant="contained" onClick={handleCreatePurchaseClick} sx={{ mb: 3 }}>Create Purchase</Button>
            {isPurchaseLoading ?
                <Typography>Loading...</Typography> : purchases.length === 0 ?
                <Typography>No purchases found.</Typography> :
            <TableContainer component={Paper} sx={{ borderRadius:3, overflow: 'hidden'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Date</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Supplier</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Items Count</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Total Price</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { purchases.map((p) => (
                            <TableRow key={p.id} hover onClick={() => handlePurchaseClick(p)} sx={{ cursor: "pointer" }}>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{new Date(p.date).toLocaleDateString()}</TableCell>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{p.supplier.name}</TableCell>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{p.items.length}</TableCell>
                                <TableCell align="center" >{`$${p.totalPrice.toFixed(2)}`}</TableCell>
                            </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            }

            {selectedPurchase && <PurchaseDetailsDialog selectedPurchase={selectedPurchase} open={dialogOpen} onClose={handlePurchaseClose}/>}
            {createDialogOpen && <CreatePurchaseDialog open={createDialogOpen} onClose={handleCreatePurchaseClose} onPurchaseCreated={handlePurchaseCreated} suppliers={suppliers}/>}
        </Box>
    )
}

export default PurchasesPage;