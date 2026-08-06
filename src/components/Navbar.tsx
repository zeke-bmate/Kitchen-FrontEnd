import { HomeOutlined, Inventory2Outlined, LocalDining, LocalShipping, MenuBook, ShoppingCart, Warehouse, LogoutOutlined, ReceiptOutlined, GroupOutlined } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText, FormControl, MenuItem, Select, } from "@mui/material";
import { Link } from "react-router-dom";
import useAuth from "../context/useAuth";
import { useTranslation} from "react-i18next";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import type { SelectChangeEvent } from "@mui/material";

const pages = [{ label: "navbar.dashboard", path: '/sales-import', icon: HomeOutlined, roles: ["Admin", "DeePlace", "Echo"]},
               { label: 'navbar.orders', path: '/orders', icon: ReceiptOutlined, roles: ["Admin", "DeePlace", "Echo"]}, 
               { label: 'navbar.suppliers', path: '/suppliers', icon: LocalShipping, roles: ["Admin", "Echo"]},
               { label: 'navbar.purchases', path: '/purchases', icon: ShoppingCart, roles: ["Admin", "Echo"]},
               { label: 'navbar.ingredients', path: '/raw-ingredients', icon: Inventory2Outlined, roles: ["Admin", "DeePlace", "Echo"]},
               { label: 'navbar.recipes', path: '/recipes', icon: MenuBook, roles: ["Admin", "DeePlace", "Echo"]},
               { label: 'navbar.production', path: '/production-batches', icon: LocalDining, roles: ["Admin", "Echo"]},
               { label: 'navbar.inventory', path: '/finished-inventory', icon: Warehouse, roles: ["Admin", "DeePlace", "Echo"]},
               { label: 'navbar.users', path: '/users', icon: GroupOutlined, roles: ["Admin"]},
];
function NavBar() {

    const { logout, role } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (
      event: SelectChangeEvent<string>
    ) => {
      i18n.changeLanguage(event.target.value);
      localStorage.setItem("language", event.target.value);
    };

    const handleOpenMenu = () => {
      setMenuOpen(true);
    };

    const handleCloseMenu = () => {
      setMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
    }

    const visiblePages = pages.filter(
                          (page) => !page.roles || (role && page.roles.includes(role))
                        );

    return (
        <>
            <AppBar position='static' elevation={1}>
                <Toolbar sx={{ backgroundColor: 'primary.main'}}>
                    <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="open navigation menu"
                      onClick={handleOpenMenu}
                      sx={{ mr: 1 }}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Typography variant= 'h6' sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
                        Kitchen Books
                    </Typography>
                     <Box sx={{ flexGrow: 1 }} />
                     <Drawer
                       anchor="left"
                       open={menuOpen}
                       onClose={handleCloseMenu}
                     >
                       <Box sx={{ width: 280 }} role="presentation">
                         <List>
                           {visiblePages.map((page) => {
                             const Icon = page.icon;
                        
                             return (
                               <ListItemButton
                                 key={page.path}
                                 component={Link}
                                 to={page.path}
                                 onClick={handleCloseMenu}
                               >
                                 <ListItemIcon>
                                   <Icon />
                                 </ListItemIcon>
                            
                                 <ListItemText primary={t(page.label)} />
                               </ListItemButton>
                             );
                           })}
                         </List>
                       </Box>
                     </Drawer>
                        <FormControl
                          size="small"
                          sx={{
                            minWidth: 130,
                            mr: 1,
                          }}
                        >
                          <Select
                            value={i18n.language}
                            onChange={handleLanguageChange}
                            sx={{
                              color: "white",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(255,255,255,0.5)",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "white",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "white",
                              },
                              "& .MuiSvgIcon-root": {
                                color: "white",
                              },
                            }}
                          >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="es">Español</MenuItem>
                            <MenuItem value="zh-HK">繁體中文</MenuItem>
                          </Select>
                        </FormControl>
                        <Button
                          onClick={handleLogout}
                          sx={{ color: "#FFF" }}
                          startIcon={<LogoutOutlined />}
                        >
                          {t("navbar.logout")}
                        </Button>
                       
                </Toolbar>
            </AppBar>
        </>
    )
}

export default NavBar;