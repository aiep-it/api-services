// api-services/app.js
const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const db = require('./src/config/db');
const version = process.env.API_VERSION || '1.0';


const userRoutes = require('./src/routers/user.routes');
const webhookRouter = require('./src/routers/webhook.routes');
const roadmapRoutes = require('./src/routers/roadmap.routes');
const categoryRoutes = require('./src/routers/category.routes');
const nodeRoutes = require('./src/routers/node.routes');
const vocabRoutes = require('./src/routers/vocab.routes')


app.use(cors({
  origin: `http://localhost:${process.env.PORT}`,
  credentials: true,
}));


app.use(express.json());


app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
}));


app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRouter);


app.use('/users', userRoutes);
app.use('/roadmaps', roadmapRoutes); 
app.use('/categories', categoryRoutes);
app.use('/node', nodeRoutes);
app.use('/vocabs', vocabRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully'))
  .catch((err) => console.error('❌ MySQL connection failed:', err));

module.exports = app;
