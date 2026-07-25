import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import type { LowStockItem } from "../types/lowStockItem";

type LowStockTableProps = {
    lowStockItems: LowStockItem[]
}

function LowStockTable({lowStockItems}: LowStockTableProps) {
    if (lowStockItems.length === 0) {
        return ( 
            <>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Low Stock Ingredients
                </Typography>
                <Typography>All ingredients are sufficiently stocked.</Typography>
            </>
        )
    }
        
    return (
        <>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Low Stock Ingredients
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Item
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Quantity Remaining
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                    {lowStockItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell align="center">{item.name}</TableCell>
                            <TableCell align="center">{item.currentWeightKg.toFixed(2)} kg</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </>
    )
}

export default LowStockTable;