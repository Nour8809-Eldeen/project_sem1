# E-commerce API

A simple MVC-style Node.js, Express, and MongoDB REST API for managing categories, products, carts, and orders.

## Features
- Category CRUD
- Product CRUD with filtering, search, sorting, and pagination
- Cart management with total price calculation
- Checkout flow with stock validation and order creation
- Seed script for sample data

## Project Structure
```text
ecommerce-api/
  app.js
  server.js
  .env.example
  README.md
  package.json
  config/
    db.js
  middleware/
    asyncHandler.js
    errorHandler.js
    notFound.js
  models/
    Category.js
    Product.js
    Cart.js
    Order.js
  controllers/
    categoryController.js
    productController.js
    cartController.js
    orderController.js
  routes/
    categoryRoutes.js
    productRoutes.js
    cartRoutes.js
    orderRoutes.js
  seeds/
    seedData.js
```

## Prerequisites
- Node.js
- MongoDB running locally

## Installation
```bash
npm install
cp .env.example .env
```

## Environment Variables
Create a .env file with:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce-api
```

## Run the app
```bash
npm run dev
```

## Seed the database
```bash
npm run seed
```

## API Overview
### Categories
- GET /api/categories
- GET /api/categories/:id
- POST /api/categories
- PUT /api/categories/:id
- DELETE /api/categories/:id

### Products
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

### Cart
- POST /api/cart/add
- GET /api/cart/:userId
- PUT /api/cart/update/:userId/:productId
- DELETE /api/cart/remove/:userId/:productId
- DELETE /api/cart/clear/:userId

### Orders
- POST /api/orders
- GET /api/orders/user/:userId
- GET /api/orders/:orderId
- PUT /api/orders/:orderId/status
- DELETE /api/orders/:orderId

## Example Product Filter Query
```bash
GET /api/products?category=64abc123&minPrice=50&maxPrice=200&search=laptop&sort=-price&page=1&limit=10
```
