import type {RawIngredient} from "../types/rawIngredient.ts";
import { useState, useEffect } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box'
import { Alert, Button, InputAdornment, Stack, TextField, Typography } from "@mui/material";

function RawIngredientsPage() {

    const [ingredients, setIngredients] = useState<RawIngredient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState<string | null>("");
    const [currentWeightKg, setCurrentWeightKg] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [weightError, setWeightError] = useState<string | null>(null);

    const handleNameChange = (event) => {
        setName(event.target.value);
    }

    const handleWeightChange = (event) => {
        setCurrentWeightKg(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedName = name.trim();
        const currentWeightKgNum = Number(currentWeightKg);
        setNameError(null);
        setWeightError(null);
        setFormError(null);
        if (!trimmedName) {
            setNameError("Name must be a non empty string.");
            return;
        }
        if (!currentWeightKgNum || currentWeightKgNum< 0) {
            setWeightError("Current Weight must be a non-negative number.");
            return;
        }
        setSubmitting(true);
        const data = { name: trimmedName, currentWeightKg: currentWeightKgNum }
        try {
            const response = await fetch('http://localhost:3001/api/raw-ingredients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create raw ingredient');
            } 
        
        const createdIngredient = await response.json();

        setIngredients(previousIngredients => [...previousIngredients, createdIngredient]);
        setName("");
        setCurrentWeightKg("");
    } catch (error) {
        if (error instanceof Error) {
            setFormError(error.message);
        } else {
            setFormError("Failed to create production batch.");
        }
    } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        const fetchIngredientsData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/raw-ingredients')
                if (!response.ok) {
                    throw new Error('Network response was not ok');
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
        }

        fetchIngredientsData();

    }, []);

    if (error) return <p>{error}</p>

    return (
        <Box sx={{ padding: 4, maxWidth:1000, mx:"auto" }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Raw Ingredients</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>Track current raw inventory by weight.</Typography>
            <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={5} sx={{ mb: 3}}>
                <TextField
                  error={!!nameError}
                  helperText={nameError ? nameError : ""} 
                  label="Name"
                  value={name}
                  onChange={handleNameChange}
                />
                <TextField
                  type="Number"
                  error={!!weightError}
                  helperText={weightError ? weightError : ""} 
                  label="Weight"
                  value={currentWeightKg}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    },
                  }}
                  onChange={handleWeightChange}
                />
                <Button type='submit' variant="contained" disabled={submitting}>
                    {submitting ? "Adding..." : "Submit"}
                </Button>
            </Stack>
            </form>
            {formError && <Alert severity="error">{formError}</Alert>}
            {isLoading ?
                <Typography>Loading...</Typography> : ingredients.length === 0 ?
                <Typography>No ingredients found.</Typography> :
            <TableContainer component={Paper} sx={{ borderRadius:3, overflow: 'hidden'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>Name</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'  }}>Current Weight (Kg)</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'  }}>Created At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { ingredients.map((i) => (
                            <TableRow key={i.id} hover >
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{i.name}</TableCell>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{i.currentWeightKg.toFixed(2) + " kg"}</TableCell>
                                <TableCell align="center">{new Date(i.createdAt).toLocaleDateString()}</TableCell>
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

export default RawIngredientsPage;
