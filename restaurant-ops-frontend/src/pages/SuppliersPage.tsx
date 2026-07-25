import { useEffect, useState } from "react";
import type { Supplier } from "../types/supplier";
import { Box, Typography, Stack, TextField, Button, Alert, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState<string>("");    
    const [nameError, setNameError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleNameChange = (event) => {
        setNameError(null);
        setName(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedName = name.trim();
        setNameError(null);
        setFormError(null);
        if (!trimmedName) {
            setNameError("Name must be a non empty string.");
            return;
        }
        setSubmitting(true);
        const data = { name: trimmedName }
        try {
            const response = await fetch('http://localhost:3001/api/suppliers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create supplier');
            } 
        
        const createdSupplier = await response.json();

        setSuppliers(previousSuppliers => [createdSupplier, ...previousSuppliers]);
        setName("");
    } catch (error) {
        if (error instanceof Error) {
            setFormError(error.message);
        } else {
            setFormError("Failed to create supplier.");
        }
    } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        const fetchSuppliersData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/suppliers');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setSuppliers(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message)
                } else {
                    setError("Failed to load suppliers data");
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchSuppliersData();

    }, []); 

    if (error) return <p>{error}</p>

    return (
        <Box sx={{ padding: 4, maxWidth:1000, mx:"auto" }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Suppliers</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>Track suppliers by name.</Typography>
            <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={5} sx={{ mb: 3}}>
                <TextField
                  error={!!nameError}
                  helperText={nameError ? nameError : ""} 
                  label="Name"
                  value={name}
                  onChange={handleNameChange}
                />
                <Button type='submit' variant="contained" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Supplier"}
                </Button>
            </Stack>
            </form>
            {formError && <Alert severity="error">{formError}</Alert>}
            {isLoading ?
                <Typography>Loading...</Typography> : suppliers.length === 0 ?
                <Typography>No suppliers found.</Typography> :
            <TableContainer component={Paper} sx={{ borderRadius:3, overflow: 'hidden'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Name</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Created At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { suppliers.map((s) => (
                            <TableRow key={s.id} hover>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{s.name}</TableCell>
                                <TableCell align="center">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            }
        </Box>
    )
}

export default SuppliersPage;