# Pages Directory Structure

This directory contains all the React page components organized by functionality and user roles for easy identification and maintenance.

## Folder Structure

### 📁 Auth/
Authentication-related pages
- `login.jsx` - User login page
- `register.jsx` - User registration page
- `GoogleAuthCallback.jsx` - Google OAuth callback handler
- `GoogleAuthSuccessHandler.jsx` - Google OAuth success handler

### 📁 Admin/
Administrator-specific pages
- `adminDashboard.jsx` - Main admin dashboard
- `AdminProfile.jsx` - Admin profile management
- `UserManagement.jsx` - User management interface
- `SystemSecurity.jsx` - System security settings
- `BackupAndRecovery.jsx` - Backup and recovery management
- `RolePermissions.jsx` - Role and permissions management

### 📁 Staff/
Staff member pages
- `StaffDashboard.jsx` - Staff dashboard
- `StaffProfile.jsx` - Staff profile management
- `StaffProfileSettings.jsx` - Staff profile settings

### 📁 Supplier/
Supplier-related pages
- `SupplierHome.jsx` - Supplier home page
- `supplierDashboard.jsx` - Supplier dashboard
- `SupplierManagement.jsx` - Supplier management
- `SupplierPayment.jsx` - Payment management
- `SupplyRecode.jsx` - Supply record management
- `SupplierAssignment.jsx` - Supplier assignment
- `CreateSupplier.jsx` - Create new supplier
- `EditSupplier.jsx` - Edit supplier details
- `DeleteSuppliers.jsx` - Delete supplier
- `ShowSupplier.jsx` - View supplier details
- `Profile.jsx` - Supplier profile
- `Setting.jsx` - Supplier settings
- `CreateSupplierRecode.jsx` - Create supplier record
- `EditSupplierRecode.jsx` - Edit supplier record
- `DeleteSupplyRecode.jsx` - Delete supply record
- `ShowSupplyRecode.jsx` - View supply record
- `StaffProfile.jsx` - Staff profile (supplier context)

### 📁 Inventory/
Inventory management pages
- `inventories.jsx` - Main inventory listing
- `InventoryManagement.jsx` - Inventory management interface
- `createInventory.jsx` - Create new inventory item
- `editInventory.jsx` - Edit inventory item
- `deleteInventory.jsx` - Delete inventory item
- `showInventory.jsx` - View inventory details
- `leavesQuantity.jsx` - Tea leaves quantity management
- `Rawleaves.jsx` - Raw tea leaves management
- `Rawtealeaves.jsx` - Raw tea leaves listing
- `Rawtealeavescreate.jsx` - Create raw tea leaves
- `Rawtealeavesdelete.jsx` - Delete raw tea leaves
- `Rawtealeavesupdate.jsx` - Update raw tea leaves

### 📁 Production/
Production management pages
- `Production.jsx` - Main production interface
- `ProductionManagerDashboard.jsx` - Production manager dashboard
- `WasteManagement.jsx` - Waste management system

### 📁 Reports/
Reporting and analytics pages
- `ReportsDashboard.jsx` - Main reports dashboard
- `ReportsPage.jsx` - Reports listing and generation

### 📁 System/
System utilities and common pages
- `DiagnosticPage.jsx` - System diagnostics
- `EmergencyFallback.jsx` - Emergency fallback page
- `LoadingDashboard.jsx` - Loading dashboard
- `MessagesPage.jsx` - Messaging system
- `OrderCancel.jsx` - Order cancellation
- `OrderSuccess.jsx` - Order success page
- `paymentSummary.jsx` - Payment summary
- `transaction.jsx` - Transaction management
- `Unauthorized.jsx` - Unauthorized access page
- `editProfile.jsx` - Profile editing
- `userProfile.jsx` - User profile view

### 📁 Public/
Public-facing pages
- `homePage.jsx` - Main homepage
- `SimpleHomePage.jsx` - Simplified homepage
- `ContactUs.jsx` - Contact us page
- `WhoWeAre.jsx` - About us page

### 📁 examples/
Example and reference files
- `RefactoredSupplierForm.jsx` - Example supplier form

## Benefits of This Structure

1. **Role-based Organization**: Pages are grouped by user roles (Admin, Staff, Supplier)
2. **Functional Grouping**: Related functionality is grouped together (Auth, Inventory, Production)
3. **Easy Navigation**: Developers can quickly find relevant pages
4. **Scalability**: Easy to add new pages to appropriate categories
5. **Maintenance**: Easier to maintain and update related functionality
6. **Team Collaboration**: Clear separation allows multiple developers to work on different areas

## Import Path Updates

All import paths in `App.jsx` and `RoleBasedDashboard.jsx` have been updated to reflect the new folder structure. When adding new pages, ensure you:

1. Place the page in the appropriate folder
2. Update import statements in `App.jsx` if it's a new route
3. Update any component imports that reference the moved page
4. Follow the naming convention: `PascalCase.jsx` for page components
