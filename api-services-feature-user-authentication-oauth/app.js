const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
require('dotenv').config();

const app = express();
const db = require('./src/config/db');

// Swagger setup
const { swaggerUi, swaggerSpec } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// CORS, JSON, Clerk
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(clerkMiddleware({ secretKey: process.env.CLERK_SECRET_KEY }));

// Raw webhook + routes
app.use('/api/webhooks', express.raw({ type: 'application/json' }), require('./src/routers/webhookRouter'));
app.use('/api/users', require('./src/routers/userRoutes'));
app.use('/api/roadmaps', require('./src/routers/roadmapRoutes'));
app.use('/api/categories', require('./src/routers/categoryRoutes'));

// DB
db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully! you gay baby'))
  .catch((err) => console.error('❌ MySQL connection failed:', err));

module.exports = app;
