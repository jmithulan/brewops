# BrewOps - Tea Factory Management System

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

### 1. Clone the Repository
```bash
git clone <repository-url>
cd brewops
```

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
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=brewops_db
DB_PORT=3306

# JWT Configuration
JWT_KEY=your_super_secret_jwt_key_here
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

```
brewops/
├── backend/
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

1. Fork the repository
2. Create a feature branch
3. Make your changes
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
