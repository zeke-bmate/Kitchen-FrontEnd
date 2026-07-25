import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import type { RecentImport } from "../types/recentImport";
import { format } from 'date-fns';

type RecentImportTableProps = {
    recentImports: RecentImport[]
}

function RecentImportTable({recentImports}: RecentImportTableProps) {
    if (recentImports.length === 0) {
        return (
        <>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Recently Imported Items
            </Typography>
            <Typography>No recent imports.</Typography>
        </>
        )
    }
        
    return (
        <>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Recently Imported Items
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Import Date/Time
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      POS Product Name
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Mapped Recipe
                    </TableCell>
                    <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: "primary.main" }}>
                      Quantity Sold
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                    {recentImports.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell align="center">{item.importedAt ? format(new Date(item.importedAt), "MMM d, yyyy, h:mm a") : "N/A"}</TableCell>
                            <TableCell align="center">{item.posProductName}</TableCell>
                            <TableCell align="center">{item.recipe.name}</TableCell>
                            <TableCell align="center">{item.quantitySold}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </>
    )
}

export default RecentImportTable;