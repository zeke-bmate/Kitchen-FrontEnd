import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RawIngredientsPage from './pages/RawIngredientsPage';
import FinishedInventoryPage from './pages/FinishedInventoryPage';
import NavBar from './components/Navbar';
import ProductionBatchesPage from './pages/ProductionBatchesPage';
import RecipesPage from './pages/RecipesPage';
import SuppliersPage from './pages/SuppliersPage';
import PurchasesPage from './pages/PurchasesPage';
import SalesImportPage from './pages/SalesImportPage';

function App() {
    return (
        <BrowserRouter>
            <NavBar />
            <Routes>
            <Route path="/" element={<RawIngredientsPage />} />
                <Route path="/raw-ingredients" element={<RawIngredientsPage />} />
                <Route path="/finished-inventory" element={<FinishedInventoryPage />} />
                <Route path="/production-batches" element={<ProductionBatchesPage />} />
                <Route path="/recipes" element={<RecipesPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                <Route path="/sales-import" element={<SalesImportPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;