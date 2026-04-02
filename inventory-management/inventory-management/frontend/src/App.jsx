import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PageLayout from './components/PageLayout';

// Auth
import Login from './pages/auth/Login';

// Inventory Pages
import ProductList from './pages/inventory/ProductList';
import AddProduct from './pages/inventory/AddProduct';
import EditProduct from './pages/inventory/EditProduct';

// Suppliers Pages
import SupplierList from './pages/suppliers/SupplierList';
import AddSupplier from './pages/suppliers/AddSupplier';
import EditSupplier from './pages/suppliers/EditSupplier';

// Invoices Pages
import InvoiceList from './pages/invoices/InvoiceList';
import CreateInvoice from './pages/invoices/CreateInvoice';
import InvoiceDetail from './pages/invoices/InvoiceDetail';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

const ProtectedRoute = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected Application Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PageLayout />}>
            {/* Default Route */}
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          
          {/* Inventory */}
          <Route path="/inventory" element={<ProductList />} />
          <Route path="/inventory/add" element={<AddProduct />} />
          <Route path="/inventory/edit/:id" element={<EditProduct />} />
          
          {/* Suppliers */}
          <Route path="/suppliers" element={<SupplierList />} />
          <Route path="/suppliers/add" element={<AddSupplier />} />
          <Route path="/suppliers/edit/:id" element={<EditSupplier />} />
          
          {/* Invoices */}
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
