# Universal POS System - Backend API

## Installation

1. Install Node.js dependencies:
```bash
cd backend
npm install
```

2. Create PostgreSQL database:
```bash
psql -U postgres
\c postgres
\i config/database.sql
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Start the server:
```bash
npm run dev
```

Server runs on http://localhost:5000

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Role-based access control (admin, manager, cashier)

### Product Management
- Create, read, update products
- Barcode scanning support
- Inventory tracking

### Orders & Payments
- Create and track orders
- Stripe payment integration
- PDF receipt generation
- Payment refunds

### Customers
- Customer profiles
- Loyalty points
- Purchase history

### Reports
- Daily sales reports
- Product sales analytics
- Customer analytics
- Inventory reports
- Revenue dashboard

### Exchange Rates
- Real-time currency conversion
- Support for multiple currencies

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search/barcode?barcode=CODE` - Search by barcode
- `POST /api/products` - Create product (manager/admin)
- `PUT /api/products/:id` - Update product (manager/admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID with items
- `POST /api/orders` - Create order
- `GET /api/orders/:id/receipt` - Generate PDF receipt

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/order/:orderId` - Get order payments
- `POST /api/payments/refund` - Refund payment

### Exchange Rates
- `GET /api/exchange-rates/current?from=USD&to=EUR` - Get current rate
- `GET /api/exchange-rates/stored` - Get cached rates

### Reports
- `GET /api/reports/sales/daily` - Daily sales report
- `GET /api/reports/products/sales` - Product sales report
- `GET /api/reports/customers/analytics` - Customer analytics
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/inventory/low-stock` - Low stock alerts
- `GET /api/reports/dashboard` - Dashboard metrics

### Users
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id/role` - Update user role (admin)
- `PUT /api/users/:id/disable` - Disable user (admin)

## Database Schema

Tables:
- `users` - User accounts
- `products` - Product catalog
- `customers` - Customer profiles
- `orders` - Sales orders
- `order_items` - Items in orders
- `payments` - Payment records
- `inventory_logs` - Stock change history
- `exchange_rates` - Currency rates cache

## Authorization

All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

Roles:
- `admin` - Full access
- `manager` - Access to products, reports
- `cashier` - Access to POS, orders

## Payment Integration

Stripe is configured for payment processing. Ensure `STRIPE_SECRET_KEY` is set in .env

## Exchange Rate API

Uses exchangerate-api.com. Get free API key at https://www.exchangerate-api.com/
