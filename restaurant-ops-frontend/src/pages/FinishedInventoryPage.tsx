import { useEffect, useState } from "react";
import type { FinishedInventory } from "../types/finishedInventory";
import Box from "@mui/material/Box";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function FinishedInventoryPage() {

    const [finishedInventory, setFinishedInventory] = useState<FinishedInventory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFinishedInventoryData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/finished-inventory')
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setFinishedInventory(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load Production Batch Data");
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchFinishedInventoryData();

    }, []);

    if (error) return <p>{error}</p>

    return (
        <Box sx={{ padding: 4, maxWidth:1000, mx:"auto" }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Finished Inventory</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>Track current finished inventory by servings.</Typography>
            {isLoading ?
                <Typography>Loading...</Typography> : finishedInventory.length === 0 ?
                <Typography>No finished inventory found.</Typography> :
            <TableContainer component={Paper} sx={{ borderRadius:3, overflow: 'hidden'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Recipe</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Quantity Available</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>Updated At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { finishedInventory
                            .filter((i) => i.quantityAvailable > 0)
                            .map((i) => (
                            <TableRow key={i.id} hover>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{i.recipe.name}</TableCell>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{i.quantityAvailable}</TableCell>
                                <TableCell align="center">{new Date(i.updatedAt).toLocaleDateString()}</TableCell>
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

export default FinishedInventoryPage;