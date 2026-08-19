import { Dialog, DialogTitle, DialogContent, Typography, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, Stack, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from "react-i18next";

const formatUnit = (unit) => {
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
    default:
      return "";
  }
};

function PurchaseDetailsDialog({
    selectedPurchase,
    open,
    onClose,
    onEdit,
}) {
  const { t } = useTranslation();
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
        <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>{t("purchases.details.title")}</DialogTitle>
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
          {selectedPurchase && (
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
                        <Typography sx={{ mb:1 }}><strong>{t("purchases.details.supplier")}:</strong>  {selectedPurchase.supplier.name}</Typography>
                        <Typography sx={{ mb:1 }}><strong>{t("purchases.details.date")}:</strong> {new Date(selectedPurchase.date).toLocaleDateString()}</Typography>
                        <Typography sx={{ mb: 1 }}>
                          <strong>{t("purchases.details.subtotal")}:</strong>{" "}
                          ₡{selectedPurchase.subtotal.toFixed(2)}
                        </Typography>
                                                
                        <Typography sx={{ mb: 1 }}>
                          <strong>
                            {t("purchases.details.tax")} ({selectedPurchase.taxRate}%):
                          </strong>{" "}
                          ₡{selectedPurchase.taxAmount.toFixed(2)}
                        </Typography>
                                                
                        <Typography>
                          <strong>{t("purchases.details.totalPrice")}:</strong>{" "}
                          ₡{selectedPurchase.totalPrice.toFixed(2)}
                        </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => {
                        onEdit(selectedPurchase);
                      }}
                    >
                      {t("purchases.details.editPurchase")}
                    </Button>
                </Stack>
              <Divider sx={{ mb:2 }}/>
              <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'}}>{t("purchases.details.item")}</TableCell>
                            <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'  }}>{t("purchases.details.orderUnits")}</TableCell>
                            <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'  }}>{t("purchases.details.quantity")}</TableCell>
                            <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'  }}>{t("purchases.details.pricePerUnit")}</TableCell>
                            <TableCell align="center" sx={{ color: "white", fontWeight: 700, backgroundColor: 'primary.main', borderBottom: '1px solid #e0e0e0'  }}>{t("purchases.details.total")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { selectedPurchase.items.map((i) => (
                            <TableRow key={i.id} hover>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{i.itemName}</TableCell>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{i.orderUnits || "—"}</TableCell>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>{i.quantity}{" "}
                                                                                                        {i.rawIngredient
                                                                                                          ? formatUnit(i.rawIngredient.canonicalUnit)
                                                                                                          : ""}</TableCell>
                                <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0'}}>₡{i.pricePerUnit.toFixed(2)}</TableCell>
                                <TableCell align="center" >₡{i.totalPrice.toFixed(2)}</TableCell>
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

export default PurchaseDetailsDialog;