# GreenCart Logistics - Delivery Simulation & KPI Dashboard

A comprehensive full-stack application for simulating delivery operations and calculating KPIs for GreenCart Logistics, an eco-friendly delivery company.

## 🚀 Project Overview

GreenCart Logistics is an internal tool that helps managers experiment with staffing, delivery schedules, and route allocations to optimize profits and efficiency. The application simulates delivery operations based on custom company rules and provides detailed analytics through an intuitive dashboard.

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Chart.js & React-Chartjs-2** for data visualization
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

### Testing
- **Jest** for unit testing
- **Supertest** for API testing

## 📋 Features

### Dashboard
- Real-time KPI display (Total Profit, Efficiency Score)
- Interactive charts for delivery performance and fuel costs
- Recent simulation history
- Responsive design for desktop and mobile

### Simulation Engine
- Configurable parameters (drivers, start time, max hours)
- Custom business rules implementation
- Real-time calculation of profits and efficiency
- Historical simulation tracking

### Management Interfaces
- **Drivers Management**: CRUD operations for driver data
- **Routes Management**: Route configuration with traffic levels
- **Orders Management**: Order tracking and assignment

### Authentication & Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting and security headers

## 🏗️ Project Structure

```
greencart-logistics/
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/           # React contexts
│   │   ├── services/           # API services
│   │   └── ...
│   └── ...
├── backend/
│   ├── models/                 # MongoDB models
│   ├── routes/                 # Express routes
│   ├── middleware/             # Custom middleware
│   ├── tests/                  # Test files
│   ├── data/                   # CSV data files
│   └── scripts/                # Utility scripts
└── ...
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/greencart-logistics
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ADMIN_EMAIL=manager@greencart.com
   ADMIN_PASSWORD=password123
   ADMIN_NAME=System Manager
   ```

4. **Seed Initial Data**
   ```bash
   node scripts/seedData.js
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create `.env` file in root directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Test Coverage
```bash
cd backend
npm run test:coverage
```

## 📊 Business Rules Implementation

The simulation engine implements the following custom business rules:

1. **Late Delivery Penalty**: ₹50 penalty if delivery time exceeds base route time + 10 minutes
2. **Driver Fatigue Rule**: 30% speed decrease next day if driver works >8 hours
3. **High-Value Bonus**: 10% bonus for orders >₹1000 delivered on time
4. **Fuel Cost Calculation**: 
   - Base cost: ₹5/km per route
   - High traffic surcharge: +₹2/km
5. **Efficiency Score**: (On-time Deliveries / Total Deliveries) × 100

## 🔐 Authentication

### Default Login Credentials
- **Email**: manager@greencart.com
- **Password**: password123

### API Authentication
All API endpoints (except auth) require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Data Management Endpoints
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create new route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Simulation Endpoints
- `POST /api/simulation/run` - Run delivery simulation
- `GET /api/simulation/history` - Get simulation history
- `GET /api/simulation/history/:id` - Get specific simulation result
- `DELETE /api/simulation/history/:id` - Delete simulation result

### Example API Request
```javascript
// Run Simulation
POST /api/simulation/run
Content-Type: application/json
Authorization: Bearer <token>

{
  "available_drivers": 5,
  "start_time": "09:00",
  "max_hours_per_day": 8
}
```

### Example API Response
```json
{
  "total_profit": 45750,
  "efficiency_score": 85.2,
  "on_time_deliveries": 23,
  "late_deliveries": 4,
  "fuel_cost_breakdown": {
    "base_cost": 1250,
    "surcharge": 340,
    "total": 1590
  },
  "simulation_params": {
    "available_drivers": 5,
    "start_time": "09:00",
    "max_hours_per_day": 8
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)
1. Create account on Railway or Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy automatically from main branch

### Frontend Deployment (Netlify/Vercel)
1. Build the application: `npm run build`
2. Deploy `dist` folder to Netlify or Vercel
3. Set environment variables for production API URL

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster and database
3. Update MONGODB_URI in environment variables
4. Whitelist deployment server IPs

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/greencart-logistics
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=manager@greencart.com
ADMIN_PASSWORD=password123
ADMIN_NAME=System Manager
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎯 Key Features Implemented

- ✅ JWT Authentication with secure password hashing
- ✅ Complete CRUD operations for all entities
- ✅ Advanced simulation engine with custom business rules
- ✅ Real-time dashboard with interactive charts
- ✅ Responsive design for all screen sizes
- ✅ Comprehensive error handling and validation
- ✅ Unit and integration tests
- ✅ API rate limiting and security headers
- ✅ Data persistence with MongoDB
- ✅ RESTful API design with proper HTTP status codes

## 🧪 Testing Strategy

### Backend Testing
- Unit tests for business logic
- Integration tests for API endpoints
- Authentication and authorization testing
- Database operation testing
- Error handling validation

### Frontend Testing
- Component unit tests
- API integration tests
- User interaction testing
- Responsive design testing

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Security headers with Helmet
- Input validation and sanitization
- SQL injection prevention with Mongoose
- XSS protection

## 📈 Performance Optimizations

- Database indexing for frequently queried fields
- Pagination for large datasets
- Efficient chart rendering with Chart.js
- Lazy loading for components
- API response caching strategies
- Optimized bundle size with Vite

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Full Stack Developer**: Implementation of complete application
- **UI/UX Designer**: Responsive design and user experience
- **Backend Engineer**: API development and database design
- **DevOps Engineer**: Deployment and infrastructure setup

## 📞 Support

For support and questions:
- Email: support@greencart.com
- Documentation: [API Docs](https://api.greencart.com/docs)
- Issues: [GitHub Issues](https://github.com/greencart/logistics/issues)

---

**GreenCart Logistics** - Optimizing delivery operations for a sustainable future 🌱