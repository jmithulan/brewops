import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/authcontext';
import { SocketProvider } from './contexts/socketContext';
import { NotificationProvider } from './contexts/notificationContext';
import Layout from './components/Layout';
import MinimalLayout from './components/MinimalLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AppLoading from './components/AppLoading';
import SimpleFallback from './components/SimpleFallback';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingDashboard from './pages/LoadingDashboard';
import DashboardPreloader from './components/DashboardPreloader';

// Pages that are needed for initial render - don't lazy load
import LoginPage from './pages/login';
import DiagnosticPage from './pages/DiagnosticPage';
import EmergencyFallback from './pages/EmergencyFallback';
import HomePage from './pages/homePage';

import ModernProductionDashboard from './pages/ProductionManagerDashboard';

// Lazy load all other pages to improve initial load time
const Inventories = lazy(() => import('./pages/inventories'));
const CreateInventory = lazy(() => import('./pages/createInventory'));
const ShowInventory = lazy(() => import('./pages/showInventory'));
const EditInventory = lazy(() => import('./pages/editInventory'));
const DeleteInventory = lazy(() => import('./pages/deleteInventory'));

// Supplier pages (from Supplier subdirectory)
const Suppliers = lazy(() => import('./pages/Supplier/SupplierRecode'));
const CreateSupplier = lazy(() => import('./pages/Supplier/CreateSupplier'));
const ShowSupplier = lazy(() => import('./pages/Supplier/ShowSupplier'));
const EditSupplier = lazy(() => import('./pages/Supplier/EditSupplier'));
const DeleteSupplier = lazy(() => import('./pages/Supplier/DeleteSuppliers'));

// Other existing pages
const WhoWeAre = lazy(() => import('./pages/WhoWeAre'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Register = lazy(() => import('./pages/register'));

// Dashboard pages with preloadable implementation to prevent white screens
const StaffDashboard = lazy(() => import('./pages/staffDashboard'));
const SupplierDashboard = lazy(() => import('./pages/supplierDashboard'));
const AdminDashboard = lazy(() => import('./pages/adminDashboard'));

const OrderCancel = lazy(() => import('./pages/OrderCancel'));
const Reports = lazy(() => import('./pages/ReportsPage'));
const Profile = lazy(() => import('./pages/Supplier/Profile'));

// Route loading component with progress bar
function RouteLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      padding: '20px',
      background: '#f8fafc',
      height: '100vh'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '6px solid #e2e8f0',
        borderTop: '6px solid #166534',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      <p style={{ color: '#4b5563', fontSize: '16px', fontWeight: '500' }}>Loading your dashboard...</p>
      <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>This may take a few seconds</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Main app routes component
function AppRoutes() {
  const location = useLocation();
  
  return (
    <>
      <Routes location={location}>
        {/* Public routes with minimal layout */}
        <Route element={<MinimalLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={
            <Suspense fallback={<RouteLoading />}>
              <Register />
            </Suspense>
          } />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/emergency" element={<EmergencyFallback />} />
        </Route>
        
        {/* Protected routes with full layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={
            <Suspense fallback={<LoadingDashboard />}>
              <Profile />
            </Suspense>
          } />
          <Route path="/staff-dashboard" element={
            <Suspense fallback={<LoadingDashboard />}>
              <StaffDashboard />
            </Suspense>
          } />
          <Route path="/supplier-dashboard" element={
            <Suspense fallback={<LoadingDashboard />}>
              <SupplierDashboard />
            </Suspense>
          } />
          <Route path="/admin-dashboard" element={
            <Suspense fallback={<LoadingDashboard />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="/order-cancel" element={
            <Suspense fallback={<LoadingDashboard />}>
              <OrderCancel />
            </Suspense>
          } />
        </Route>
        
        {/* Layout with Navbar for authenticated routes - all with Suspense for lazy loading */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/AboutUs" element={
            <Suspense fallback={<RouteLoading />}>
              <WhoWeAre />
            </Suspense>
          } />
          <Route path="/ContactUs" element={
            <Suspense fallback={<RouteLoading />}>
              <ContactUs />
            </Suspense>
          } />
          
          {/* Inventory routes */}
          <Route path="/inventory" element={
            <Suspense fallback={<RouteLoading />}>
              <Inventories />
            </Suspense>
          } />
          <Route path="/inventory/new" element={
            <Suspense fallback={<RouteLoading />}>
              <CreateInventory />
            </Suspense>
          } />
          <Route path="/inventory/:id" element={
            <Suspense fallback={<RouteLoading />}>
              <ShowInventory />
            </Suspense>
          } />
          <Route path="/inventory/edit/:id/" element={
            <Suspense fallback={<RouteLoading />}>
              <EditInventory />
            </Suspense>
          } />
          <Route path="/inventory/:id/delete" element={
            <Suspense fallback={<RouteLoading />}>
              <DeleteInventory />
            </Suspense>
          } />
          
          {/* Supplier routes */}
          <Route path="/suppliers" element={
            <Suspense fallback={<RouteLoading />}>
              <Suppliers />
            </Suspense>
          } />
          <Route path="/suppliers/new" element={
            <Suspense fallback={<RouteLoading />}>
              <CreateSupplier />
            </Suspense>
          } />
          <Route path="/suppliers/:id" element={
            <Suspense fallback={<RouteLoading />}>
              <ShowSupplier />
            </Suspense>
          } />
          <Route path="/suppliers/:id/edit" element={
            <Suspense fallback={<RouteLoading />}>
              <EditSupplier />
            </Suspense>
          } />
          <Route path="/suppliers/:id/delete" element={
            <Suspense fallback={<RouteLoading />}>
              <DeleteSupplier />
            </Suspense>
          } />
          
          {/* Reports route */}
          <Route path="/reports" element={
            <Suspense fallback={<RouteLoading />}>
              <Reports />
            </Suspense>
          } />

          {/* Modern Production Dashboard route */}
          <Route path="/ProductionManagerDashboard" element={
            <Suspense fallback={<RouteLoading />}>
              <ModernProductionDashboard />
            </Suspense>
          } />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  // Wrap in an error boundary
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <BrowserRouter>
              <DashboardPreloader />
              <AppRoutes />
            </BrowserRouter>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Using the imported ErrorBoundary component from './components/ErrorBoundary'