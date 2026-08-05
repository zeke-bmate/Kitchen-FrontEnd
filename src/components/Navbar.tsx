import { HomeOutlined, Inventory2Outlined, LocalDining, LocalShipping, MenuBook, ShoppingCart, Warehouse, LogoutOutlined, ReceiptOutlined, GroupOutlined } from "@mui/icons-material";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import useAuth from "../context/useAuth";

const pages = [{ name: 'Home', path: '/sales-import', icon: HomeOutlined, roles: ["Admin", "DeePlace", "Echo"]},
               { name: 'Orders', path: '/orders', icon: ReceiptOutlined, roles: ["Admin", "DeePlace", "Echo"]}, 
               { name: 'Suppliers', path: '/suppliers', icon: LocalShipping, roles: ["Admin", "Echo"]},
               { name: 'Purchases', path: '/purchases', icon: ShoppingCart, roles: ["Admin", "Echo"]},
               { name: 'Raw Ingredients', path: '/raw-ingredients', icon: Inventory2Outlined, roles: ["Admin", "DeePlace", "Echo"]},
               { name: 'Recipes', path: '/recipes', icon: MenuBook, roles: ["Admin", "DeePlace", "Echo"]},
               { name: 'Production Batches', path: '/production-batches', icon: LocalDining, roles: ["Admin", "Echo"]},
               { name: 'Finished Inventory', path: '/finished-inventory', icon: Warehouse, roles: ["Admin", "DeePlace", "Echo"]},
               { name: 'Users', path: '/users', icon: GroupOutlined, roles: ["Admin"]},
];
function NavBar() {

    const { logout, role } = useAuth();

    const handleLogout = () => {
        logout();
    }

    const visiblePages = pages.filter(
                          (page) => !page.roles || (role && page.roles.includes(role))
                        );

    return (
        <AppBar position='static' elevation={1}>
            <Toolbar sx={{ backgroundColor: 'primary.main'}}>
                <Typography variant= 'h6' sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
                    Kitchen Books
                </Typography>
                <Box sx={{ display: 'flex', gap: 2}}>
                    {visiblePages.map((page) => {
                        const Icon = page.icon
                        
                        return (
                        <Button key={page.path} component={Link} to={page.path} sx={{ color: '#FFF'}} startIcon={<Icon />}>
                            {page.name}
                        </Button>
                    )})}
                    <Button
                      onClick={handleLogout}
                      sx={{ color: "#FFF" }}
                      startIcon={<LogoutOutlined />}
                    >
                      Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar;