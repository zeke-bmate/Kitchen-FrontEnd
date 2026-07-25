import { Dialog, DialogTitle, DialogContent, Typography, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, Stack } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

function RecipeDetailsDialog({
    selectedRecipe,
    open,
    onClose,
}) {
    return (
        <Dialog 
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            slotProps={{
              paper: {
                sx: { borderRadius: 3 },
              },
            }}
        >
        <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>{selectedRecipe?.name} Recipe</DialogTitle>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
                <CloseIcon />
            </IconButton>
        <DialogContent>
          {selectedRecipe && (
            <div>
                <Stack direction="row" sx={{ justifyContent:'space-between', alignItems:'center'}}>
                    <Box
                        sx={{
                            mb: 3,
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                          }}
                        >
                        <Typography><strong>Servings:</strong> {selectedRecipe.servings}</Typography>
                    </Box>
                    
                </Stack>
              <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>Ingredient</TableCell>
                            <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'  }}>Weight</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { selectedRecipe.ingredients.map((i) => (
                            <TableRow key={i.id} >
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{i.rawIngredient.name}</TableCell>
                                <TableCell align="center" >{i.weightKg} kg</TableCell>
                            </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>

            </div>
          )}
        </DialogContent>
      </Dialog>
    )
}

export default RecipeDetailsDialog;