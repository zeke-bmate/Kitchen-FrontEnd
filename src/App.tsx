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
import RequirePermission from "./routes/RequirePermission";

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
            <RequirePermission permission="dashboard.view">
              <SalesImportPage />
            </RequirePermission>
          } />
          <Route path="/orders" element={
            <RequirePermission permission="orders.view">
              <OrdersPage />
            </RequirePermission>
          } />
          <Route path="/raw-ingredients" element={
            <RequirePermission permission="inventory.view">
              <RawIngredientsPage />
            </RequirePermission>
          } />
          <Route path="/finished-inventory" element={
            <RequirePermission permission="finished_inventory.view">
              <FinishedInventoryPage />
            </RequirePermission>
          } />
          <Route path="/production-batches" element={
            <RequirePermission permission="production.view">
              <ProductionBatchesPage />
            </RequirePermission>
          } />
          <Route path="/recipes" element={
            <RequirePermission permission="recipes.view">
              <RecipesPage />
            </RequirePermission>
          } />
          <Route path="/suppliers" element={
            <RequirePermission permission="suppliers.view">
              <SuppliersPage />
            </RequirePermission>
          } />
          <Route path="/purchases" element={
            <RequirePermission permission="purchases.view">
              <PurchasesPage />
            </RequirePermission>
          } />
          <Route path="/sales-import" element={
            <RequirePermission permission="sales.import">
              <SalesImportPage />
            </RequirePermission>
          } />
          <Route path="/users" element={
            <RequirePermission permission="users.view">
              <UsersPage />
            </RequirePermission>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
