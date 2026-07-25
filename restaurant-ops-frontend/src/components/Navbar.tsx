import { HomeOutlined, Inventory2Outlined, LocalDining, LocalShipping, MenuBook, ShoppingCart, Warehouse } from "@mui/icons-material";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const pages = [{ name: 'Home', path: '/sales-import', icon: HomeOutlined},
               { name: 'Suppliers', path: '/suppliers', icon: LocalShipping},
               { name: 'Purchases', path: '/purchases', icon: ShoppingCart},
               { name: 'Raw Ingredients', path: '/raw-ingredients', icon: Inventory2Outlined},
               { name: 'Recipes', path: '/recipes', icon: MenuBook},
               { name: 'Production Batches', path: '/production-batches', icon: LocalDining},
               { name: 'Finished Inventory', path: '/finished-inventory', icon: Warehouse},
];
function NavBar() {
    return (
        <AppBar position='static' elevation={1}>
            <Toolbar sx={{ backgroundColor: 'primary.main'}}>
                <Typography variant= 'h6' sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
                    Kitchen Books
                </Typography>
                <Box sx={{ display: 'flex', gap: 2}}>
                    {pages.map((page) => {
                        const Icon = page.icon
                        
                        return (
                        <Button key={page.path} component={Link} to={page.path} sx={{ color: '#FFF'}} startIcon={<Icon />}>
                            {page.name}
                        </Button>
                    )})}
                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar;