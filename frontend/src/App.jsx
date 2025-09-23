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
import LoadingDashboard from './pages/System/LoadingDashboard';
import DashboardPreloader from './components/DashboardPreloader';
import RoleBasedProfile from './components/RoleBasedProfile';
import RoleBasedRoute from './components/RoleBasedRoute';

// Pages that are needed for initial render - don't lazy load
import LoginPage from './pages/Auth/login';
import GoogleAuthSuccessHandler from './pages/Auth/GoogleAuthSuccessHandler';
import DiagnosticPage from './pages/System/DiagnosticPage';
import EmergencyFallback from './pages/System/EmergencyFallback';
import HomePage from './pages/Public/homePage';

// Auth pages
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPassword.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPassword.jsx'));

// Lazy load all other pages to improve initial load time
const Inventories = lazy(() => import('./pages/Inventory/inventories'));
const CreateInventory = lazy(() => import('./pages/Inventory/createInventory'));
const ShowInventory = lazy(() => import('./pages/Inventory/showInventory'));
const EditInventory = lazy(() => import('./pages/Inventory/editInventory'));
const DeleteInventory = lazy(() => import('./pages/Inventory/deleteInventory'));

// Supplier pages (from Supplier subdirectory)
const Suppliers = lazy(() => import('./pages/Supplier/SupplierRecode'));
const CreateSupplier = lazy(() => import('./pages/Supplier/CreateSupplier'));
const ShowSupplier = lazy(() => import('./pages/Supplier/ShowSupplier'));
const EditSupplier = lazy(() => import('./pages/Supplier/EditSupplier'));
const DeleteSupplier = lazy(() => import('./pages/Supplier/DeleteSuppliers'));
const SupplierPayment = lazy(() => import('./pages/Supplier/SupplierPayment'));

// Other existing pages
const WhoWeAre = lazy(() => import('./pages/Public/WhoWeAre'));
const ContactUs = lazy(() => import('./pages/Public/ContactUs'));
const Register = lazy(() => import('./pages/Auth/register'));

// Additional pages for missing routes
const SupplierHome = lazy(() => import('./pages/Supplier/SupplierHome'));
const Production = lazy(() => import('./pages/Production/Production'));
const WasteManagement = lazy(() => import('./pages/Production/WasteManagement'));
const Rawleaves = lazy(() => import('./pages/Inventory/Rawleaves'));
const SupplyRecode = lazy(() => import('./pages/Supplier/SupplyRecode'));
const StaffProfile = lazy(() => import('./pages/Staff/StaffProfile'));
const StaffProfileSettings = lazy(() => import('./pages/Staff/StaffProfileSettings'));

// Dashboard pages with preloadable implementation to prevent white screens
const StaffDashboard = lazy(() => import('./pages/Staff/StaffDashboard'));
const SupplierDashboard = lazy(() => import('./pages/Supplier/supplierDashboard'));
const AdminDashboard = lazy(() => import('./pages/Admin/adminDashboard'));
const ProductionManagerDashboard = lazy(() => import('./pages/Production/ProductionManagerDashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const RolePermissions = lazy(() => import('./pages/Admin/RolePermissions'));
const SystemSecurity = lazy(() => import('./pages/Admin/SystemSecurity'));
const BackupAndRecovery = lazy(() => import('./pages/Admin/BackupAndRecovery'));

const OrderCancel = lazy(() => import('./pages/System/OrderCancel'));
const Reports = lazy(() => import('./pages/Reports/ReportsPage'));
const Profile = lazy(() => import('./pages/Supplier/Profile'));
const AdminProfile = lazy(() => import('./pages/Admin/AdminProfile'));
const SupplierEditProfile = lazy(() => import('./pages/Supplier/SupplierEditProfile'));
const SupplierSettings = lazy(() => import('./pages/Supplier/SupplierSettings'));
const PaymentSummary = lazy(() => import('./pages/System/paymentSummary'));

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
          <Route path="/forgot-password" element={
            <Suspense fallback={<RouteLoading />}>
              <ForgotPasswordPage />
            </Suspense>
          } />
          <Route path="/reset-password" element={
            <Suspense fallback={<RouteLoading />}>
              <ResetPasswordPage />
            </Suspense>
          } />
          <Route path="/auth/google/success" element={<GoogleAuthSuccessHandler />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/emergency" element={<EmergencyFallback />} />
        </Route>
        
        {/* Protected routes with full layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<RoleBasedProfile />} />
          <Route path="/admin/profile" element={
            <Suspense fallback={<LoadingDashboard />}>
              <AdminProfile />
            </Suspense>
          } />
          <Route path="/supplier/profile" element={
            <Suspense fallback={<LoadingDashboard />}>
              <Profile />
            </Suspense>
          } />
          <Route path="/suppliers/editProfile" element={
            <Suspense fallback={<LoadingDashboard />}>
              <SupplierEditProfile />
            </Suspense>
          } />
          <Route path="/supplier/settings" element={
            <Suspense fallback={<LoadingDashboard />}>
              <SupplierSettings />
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
          <Route path="/ProductionManagerDashboard" element={
            <Suspense fallback={<LoadingDashboard />}>
              <ProductionManagerDashboard />
            </Suspense>
          } />
          <Route path="/userManagement" element={
            <Suspense fallback={<LoadingDashboard />}>
              <UserManagement />
            </Suspense>
          } />
          <Route path="/rolePermissions" element={
            <Suspense fallback={<LoadingDashboard />}>
              <RolePermissions />
            </Suspense>
          } />
          <Route path="/systemSecurity" element={
            <Suspense fallback={<LoadingDashboard />}>
              <SystemSecurity />
            </Suspense>
          } />
          <Route path="/backupRecovery" element={
            <Suspense fallback={<LoadingDashboard />}>
              <BackupAndRecovery />
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
          <Route path="/" element={<HomePage />} />
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
          <Route path="/inventories" element={
            <Suspense fallback={<RouteLoading />}>
              <Inventories />
            </Suspense>
          } />
          <Route path="/inventories/new" element={
            <Suspense fallback={<RouteLoading />}>
              <CreateInventory />
            </Suspense>
          } />
          <Route path="/inventories/:id" element={
            <Suspense fallback={<RouteLoading />}>
              <ShowInventory />
            </Suspense>
          } />
          <Route path="/inventories/:id/edit" element={
            <Suspense fallback={<RouteLoading />}>
              <EditInventory />
            </Suspense>
          } />
          <Route path="/inventories/:id/delete" element={
            <Suspense fallback={<RouteLoading />}>
              <DeleteInventory />
            </Suspense>
          } />
          
          {/* Supplier routes - Only accessible by staff and managers */}
          <Route path="/suppliers" element={
            <RoleBasedRoute allowedRoles={['staff', 'manager', 'admin']}>
              <Suspense fallback={<RouteLoading />}>
                <Suppliers />
              </Suspense>
            </RoleBasedRoute>
          } />
          
          {/* Supply Records route - Accessible by suppliers to view their own records */}
          <Route path="/supplier/supply-records" element={
            <Suspense fallback={<RouteLoading />}>
              <SupplyRecode />
            </Suspense>
          } />
          <Route path="/suppliers/new" element={
            <RoleBasedRoute allowedRoles={['staff', 'manager', 'admin']}>
              <Suspense fallback={<RouteLoading />}>
                <CreateSupplier />
              </Suspense>
            </RoleBasedRoute>
          } />
          <Route path="/suppliers/:id" element={
            <RoleBasedRoute allowedRoles={['staff', 'manager', 'admin']}>
              <Suspense fallback={<RouteLoading />}>
                <ShowSupplier />
              </Suspense>
            </RoleBasedRoute>
          } />
          <Route path="/suppliers/:id/edit" element={
            <RoleBasedRoute allowedRoles={['staff', 'manager', 'admin']}>
              <Suspense fallback={<RouteLoading />}>
                <EditSupplier />
              </Suspense>
            </RoleBasedRoute>
          } />
          <Route path="/suppliers/:id/delete" element={
            <RoleBasedRoute allowedRoles={['staff', 'manager', 'admin']}>
              <Suspense fallback={<RouteLoading />}>
                <DeleteSupplier />
              </Suspense>
            </RoleBasedRoute>
          } />
          <Route path="/suppliers/payments/:id" element={
            <Suspense fallback={<RouteLoading />}>
              <SupplierPayment />
            </Suspense>
          } />
          <Route path="/suppliers/payments" element={
            <Suspense fallback={<RouteLoading />}>
              <SupplierPayment />
            </Suspense>
          } />
          <Route path="/suppliers/paymentSummary" element={
            <Suspense fallback={<RouteLoading />}>
              <PaymentSummary />
            </Suspense>
          } />
          
          {/* Reports route */}
          <Route path="/reports" element={
            <Suspense fallback={<RouteLoading />}>
              <Reports />
            </Suspense>
          } />
          
          {/* Additional routes for missing pages */}
          <Route path="/SupplierHome" element={
            <RoleBasedRoute allowedRoles={['staff', 'manager', 'admin']}>
              <Suspense fallback={<RouteLoading />}>
                <SupplierHome />
              </Suspense>
            </RoleBasedRoute>
          } />
          <Route path="/Production" element={
            <Suspense fallback={<RouteLoading />}>
              <Production />
            </Suspense>
          } />
          <Route path="/waste-management" element={
            <Suspense fallback={<RouteLoading />}>
              <WasteManagement />
            </Suspense>
          } />
          <Route path="/rawleaves" element={
            <Suspense fallback={<RouteLoading />}>
              <Rawleaves />
            </Suspense>
          } />
          <Route path="/supplyRecode/create" element={
            <Suspense fallback={<RouteLoading />}>
              <SupplyRecode />
            </Suspense>
          } />
          <Route path="/supplier/create-supply-recode" element={
            <Suspense fallback={<RouteLoading />}>
              <SupplyRecode />
            </Suspense>
          } />
          <Route path="/staff/profile" element={
            <Suspense fallback={<RouteLoading />}>
              <StaffProfile />
            </Suspense>
          } />
          <Route path="/staff/profile/setting" element={
            <Suspense fallback={<RouteLoading />}>
              <StaffProfileSettings />
            </Suspense>
          } />
          <Route path="/inventory/creates" element={
            <Suspense fallback={<RouteLoading />}>
              <CreateInventory />
            </Suspense>
          } />
          
          {/* 404 Fallback */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <a href="/" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                  Go Home
                </a>
              </div>
            </div>
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