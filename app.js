const express = require('express');
const app = express();
const db = require('./src/config/db');
// const userRoutes = require('./src/controllers/userController')
const userRoutes = require('./src/routers/userRoutes');

app.use(express.json());
app.use('/api/users', userRoutes);
db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully!'))
  .catch((err) => console.error('❌ MySQL connection failed:', err));

module.exports = app;