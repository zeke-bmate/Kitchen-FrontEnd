import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import RawIngredientsPage from "./pages/RawIngredientsPage";
import FinishedInventoryPage from "./pages/FinishedInventoryPage";
import NavBar from "./components/Navbar";
import ProductionBatchesPage from "./pages/ProductionBatchesPage";
import RecipesPage from "./pages/RecipesPage";
import SuppliersPage from "./pages/SuppliersPage";
import PurchasesPage from "./pages/PurchasesPage";
import SalesImportPage from "./pages/SalesImportPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import OrdersPage from "./pages/OrdersPage";
import UsersPage from "./pages/UsersPage";
import RoleRoute from "./routes/RoleRoute";

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <>
        <NavBar />
        <Outlet />
      </>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={
            <RoleRoute allowedRoles={["Admin", "DeePlace", "Echo"]}>
              <SalesImportPage />
            </RoleRoute>
          } />
          <Route path="/orders" element={
            <RoleRoute allowedRoles={["Admin", "DeePlace", "Echo"]}>
              <OrdersPage />
            </RoleRoute>
          } />
          <Route path="/raw-ingredients" element={
            <RoleRoute allowedRoles={["Admin", "DeePlace", "Echo"]}>
              <RawIngredientsPage />
            </RoleRoute>
          } />
          <Route path="/finished-inventory" element={
            <RoleRoute allowedRoles={["Admin", "DeePlace", "Echo"]}>
              <FinishedInventoryPage />
            </RoleRoute>
          } />
          <Route path="/production-batches" element={
            <RoleRoute allowedRoles={["Admin", "Echo"]}>
              <ProductionBatchesPage />
            </RoleRoute>
          } />
          <Route path="/recipes" element={
            <RoleRoute allowedRoles={["Admin", "DeePlace", "Echo"]}>
              <RecipesPage />
            </RoleRoute>
          } />
          <Route path="/suppliers" element={
            <RoleRoute allowedRoles={["Admin", "Echo"]}>
              <SuppliersPage />
            </RoleRoute>
          } />
          <Route path="/purchases" element={
            <RoleRoute allowedRoles={["Admin", "Echo"]}>
              <PurchasesPage />
            </RoleRoute>
          } />
          <Route path="/sales-import" element={
            <RoleRoute allowedRoles={["Admin", "DeePlace", "Echo"]}>
              <SalesImportPage />
            </RoleRoute>
          } />
          <Route path="/users" element={
            <RoleRoute allowedRoles={["Admin"]}>
              <UsersPage />
            </RoleRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
