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
const port = process.env.PORT || 3001;


const userRoutes = require('./src/routers/user.routes');
const webhookRouter = require('./src/routers/webhook.routes');
const roadmapRoutes = require('./src/routers/roadmap.routes');
const categoryRoutes = require('./src/routers/category.routes');
const nodeRoutes = require('./src/routers/node.routes');


app.use(cors({
  origin: `http://localhost:${port}`,
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

app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    url: '/api/swagger.json'  // 👈 fix base URL ở đây
  }
}));

// expose JSON spec tại đúng URL
app.get('/api/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});


db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully'))
  .catch((err) => console.error('❌ MySQL connection failed:', err));

module.exports = app;
