# BrewOps - Tea Factory Management System

<<<<<<< HEAD
A comprehensive full-stack application for managing tea factory operations including inventory, suppliers, payments, and user management.

## Features

### 🏭 Core Modules
- **User Management**: Role-based access control (Admin, Manager, Staff, Supplier)
- **Inventory Management**: Track tea leaves, production, and stock levels
- **Supplier Management**: Manage supplier records and relationships
- **Payment System**: Handle payments and financial transactions
- **Production Management**: Monitor production processes and quality
- **Real-time Notifications**: WebSocket-based real-time updates

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control
- Protected routes
- Secure API endpoints
- CORS configuration

### 🎨 Frontend Features
- Modern React.js with Vite
- Responsive design with Tailwind CSS
- Real-time updates with Socket.io
- Interactive charts and dashboards
- Toast notifications
- Loading states and error handling

### 🚀 Backend Features
- Node.js with Express.js
- MySQL database with connection pooling
- RESTful API design
- WebSocket support
- Rate limiting and security middleware
- Comprehensive error handling

## Tech Stack

### Frontend
- React 19.1.0
- Vite 7.0.4
- React Router DOM 7.7.1
- Tailwind CSS 4.1.11
- Axios 1.11.0
- Socket.io Client 4.8.1
- React Hot Toast 2.6.0
- Recharts 3.1.2
- Lottie React 2.4.1

### Backend
- Node.js
- Express.js 4.21.2
- MySQL2 3.14.3
- JWT 9.0.2
- Socket.io 4.8.1
- Bcryptjs 3.0.2
- CORS 2.8.5
- Helmet 8.1.0
- Morgan 1.10.1

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MySQL database
- Git

## Installation & Setup
=======
A comprehensive full-stack web application for managing tea factory operations, built with React, Node.js, Express, and MySQL.

## 🚀 Features

### Core Functionality
- **User Management**: Complete CRUD operations with role-based access control
- **Authentication**: JWT-based authentication with Google OAuth integration
- **Supplier Management**: Track suppliers, deliveries, and payments
- **Inventory Management**: Monitor raw tea leaves and finished products
- **Production Tracking**: Manage production batches and processes
- **Payment Processing**: Handle supplier payments and financial records
- **Reports & Analytics**: Generate PDF reports with natural language summaries
- **Real-time Notifications**: WebSocket-based notifications and alerts
- **Database Backup & Recovery**: Automated backup system with restore capabilities

### User Roles
- **Admin/Manager**: Full system access, user management, reports
- **Staff**: Inventory management, production tracking, supplier interactions
- **Supplier**: View assigned requests, delivery tracking, payment history

### Security Features
- JWT token authentication with role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- XSS protection and CORS configuration
- Rate limiting and security headers
- SQL injection prevention with parameterized queries

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite for fast development
- **TailwindCSS** for responsive styling
- **React Router DOM** for navigation
- **Axios** for API communication
- **Socket.io Client** for real-time features
- **React Hot Toast** for notifications
- **Lottie React** for animations

### Backend
- **Node.js** with Express.js framework
- **MySQL2** with connection pooling
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **PDFKit** for report generation
- **Bcryptjs** for password hashing
- **Express Validator** for input validation

### Database
- **MySQL** with comprehensive schema
- Connection pooling for performance
- Automated migrations and backups

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher) or XAMPP
- npm or yarn package manager

## 🚀 Quick Start
>>>>>>> b34fc7b (init)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd brewops
```

<<<<<<< HEAD
### 2. Database Setup
1. Create a MySQL database named `brewops_db`
2. Update database credentials in `backend/.env`:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=brewops_db
DB_PORT=3306
```

### 3. Backend Setup
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:5000`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`

### 5. Quick Start (Both Servers)
```bash
# Make the script executable (if not already)
chmod +x start-dev.sh

# Start both frontend and backend
./start-dev.sh
```

## Environment Variables

### Backend (.env)
=======
### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Database Setup

#### Option A: Using XAMPP (Recommended for macOS)
1. Start XAMPP and ensure MySQL is running
2. Create database:
```sql
CREATE DATABASE brewops_db;
```

#### Option B: Using MySQL directly
1. Start MySQL service
2. Create database:
```sql
CREATE DATABASE brewops_db;
```

### 4. Environment Configuration

Create `.env` file in the backend directory:
>>>>>>> b34fc7b (init)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
<<<<<<< HEAD
DB_PASSWORD=your_password
=======
DB_PASSWORD=
>>>>>>> b34fc7b (init)
DB_NAME=brewops_db
DB_PORT=3306

# JWT Configuration
JWT_KEY=your_super_secret_jwt_key_here
<<<<<<< HEAD
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=1d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
# Backend API Configuration
VITE_BACKEND_URL=http://localhost:5000

# Frontend Configuration
VITE_APP_NAME=BrewOps
VITE_APP_VERSION=1.0.0
```

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/user` - Get current user

### Inventory Management
- `GET /inventory` - Get all inventories
- `POST /inventory` - Create inventory
- `PUT /inventory/:id` - Update inventory
- `DELETE /inventory/:id` - Delete inventory

### Supplier Management
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Payment Management
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

## User Roles

### Admin
- Full system access
- User management
- System configuration
- Security settings
- Backup and recovery

### Production Manager
- Production oversight
- Inventory management
- Supplier coordination
- Quality control

### Staff
- Basic inventory access
- Limited supplier interaction
- Production assistance

### Supplier
- Supplier dashboard
- Payment tracking
- Record management
- Profile management

## Project Structure
=======
JWT_EXPIRE=1d

# Server Configuration
PORT=4323
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4323/api/auth/google/callback
```

### 5. Database Migration
```bash
cd backend
mysql -u root brewops_db < database/migrations/add_missing_columns.sql
```

### 6. Start the Application

#### Development Mode (Recommended)
```bash
# From root directory - starts both frontend and backend
npm run dev
```

#### Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 7. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4323
- **API Health Check**: http://localhost:4323/api/health

## 🧪 Testing

### API Testing with Postman
1. Import the Postman collection from `tools/postman_collection.json`
2. Set the `base_url` variable to `http://localhost:4323`
3. Run the collection to test all API endpoints

### Test User Credentials
```
Email: admin@brewops.com
Password: password123
Role: Manager (with Admin privileges)
```

## 📁 Project Structure
>>>>>>> b34fc7b (init)

```
brewops/
├── backend/
<<<<<<< HEAD
│   ├── config/
│   │   ├── database.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── inventoryController.js
│   │   ├── supplierController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Supplier.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── supplierRoutes.js
│   │   └── paymentRoutes.js
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Development

### Running in Development Mode
1. Start the backend server: `cd backend && npm start`
2. Start the frontend server: `cd frontend && npm run dev`
3. Or use the quick start script: `./start-dev.sh`

### Building for Production
```bash
# Backend
cd backend
npm install --production

# Frontend
cd frontend
npm run build
```

## Contributing
=======
│   ├── config/           # Database and OAuth configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Authentication and error handling
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── database/        # Schema and migrations
│   ├── uploads/         # File uploads (avatars)
│   ├── backups/         # Database backups
│   └── reports/         # Generated reports
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── tools/               # Postman collection and scripts
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Admin Management
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id` - Update user
- `POST /api/admin/users/:id/avatar` - Upload avatar
- `POST /api/admin/users/change-password` - Change password
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Deactivate user

### Supplier Management
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/supplier-requests/suppliers/:id/requests` - Get supplier requests
- `POST /api/supplier-requests/suppliers/:id/assign` - Assign request to supplier

### Inventory Management
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Payment Management
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Reports & Backup
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/download/:filename` - Download report
- `POST /api/admin/backup` - Create database backup
- `GET /api/admin/backups` - List backups
- `POST /api/admin/restore` - Restore database

## 🔒 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Token expiration and refresh

### Input Validation
- Express-validator for request validation
- XSS protection with xss-clean
- SQL injection prevention
- File upload validation

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Content Security Policy

## 📊 Real-time Features

### WebSocket Events
- `userStatus` - User online/offline status
- `newMessage` - Real-time messaging
- `notification` - System notifications
- `supplier:assigned` - Supplier assignment alerts
- `low-stock` - Inventory alerts
- `report:ready` - Report generation completion

### Socket Rooms
- `user_{userId}` - User-specific room
- `role_{role}` - Role-based room
- `supplier_{supplierId}` - Supplier-specific room

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and profiles
- `suppliers` - Supplier information
- `raw_tea_leaves` - Raw material inventory
- `deliveries` - Supplier deliveries
- `payments` - Payment records
- `production_batches` - Production tracking
- `notifications` - System notifications
- `supplier_requests` - Supplier assignments

### Key Features
- Foreign key constraints for data integrity
- Timestamps for audit trails
- JSON fields for flexible data storage
- Indexes for performance optimization

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
JWT_KEY=your_production_jwt_secret
FRONTEND_URL=https://your-domain.com
```

### Build for Production
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Port Already in Use**
   - Change PORT in backend `.env`
   - Update FRONTEND_URL accordingly

3. **CORS Errors**
   - Check FRONTEND_URL in backend `.env`
   - Ensure frontend is running on correct port

4. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Ensure proper file types

### Logs and Debugging
- Backend logs are displayed in the terminal
- Frontend errors appear in browser console
- Database queries are logged in development mode

## 📝 Contributing
>>>>>>> b34fc7b (init)

1. Fork the repository
2. Create a feature branch
3. Make your changes
<<<<<<< HEAD
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0
- Initial release
- Complete authentication system
- Inventory management
- Supplier management
- Payment system
- Role-based access control
- Real-time notifications


# brewops
=======
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Test with the provided Postman collection
- Check the database schema and migrations

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with external systems
- [ ] Automated testing suite
- [ ] Performance monitoring
- [ ] Advanced security features

---

**BrewOps** - Streamlining tea factory operations with modern technology.
>>>>>>> b34fc7b (init)
