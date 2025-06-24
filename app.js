// api-services/app.js
const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
require('dotenv').config();

const app = express();
const db = require('./src/config/db');
const version = process.env.API_VERSION || '1.0';


const userRoutes = require('./src/routers/user.routes');
const webhookRouter = require('./src/routers/webhook.routes');
const roadmapRoutes = require('./src/routers/roadmap.routes');
const categoryRoutes = require('./src/routers/category.routes');


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));


app.use(express.json());


app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
}));


app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);


app.use('/api/users', userRoutes);
app.use('/api/roadmaps', roadmapRoutes); 
app.use('/api/categories', categoryRoutes);


db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully! you gay baby'))
  .catch((err) => console.error('❌ MySQL connection failed:', err));

module.exports = app;
