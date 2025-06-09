const express = require('express');
const app = express();
const db = require('./src/config/db');
const version = process.env.API_VERSION || '1.0';
const userRoutes = require('./src/routers/userRoutes');
const webhookRouter = require('./src/routers/webhookRouter');
app.use(express.json());

// === <EndPoint> ===
app.use(`/api/${version}/users`, userRoutes);
app.use('/api/webhooks', webhookRouter);




// === </EndPoint> ===

db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully!'))
  .catch((err) => console.error('❌ MySQL connection failed:', err));

module.exports = app;