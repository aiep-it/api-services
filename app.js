// api-services/app.js
const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
require('dotenv').config();
require('./src/config/geminiClient.js'); 
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
const topicRoutes = require('./src/routers/topic.routes.js');
const vocabRoutes = require('./src/routers/vocab.routes')
const aiRoutes = require('./src/routers/ai.routes');
const personalLearningRoutes = require('./src/routers/personal.learning.routes.js');
const wordspaceRoutes = require('./src/routers/wordspace.routes');
const exerciseRoutes = require('./src/routers/exercise.routes');
const studentRouter = require('./src/routers/student.routes');
const studentAuthRoutes = require("./src/routers/student-auth.routes.js");
const classRoutes = require('./src/routers/class.routes.js');
const userExerciseResultRoutes = require('./src/routers/user.exercise.result.routes.js');
const reportRoutes = require('./src/routers/report.routes.js');
app.use(cors({
  origin: `http://localhost:3000`, //default ferontend URL
  
  credentials: true,
}));


app.use(express.json());


app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
}));


app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRouter);
app.use('/class', classRoutes);
app.use("/auth", studentAuthRoutes);
app.use('/users', userRoutes);
app.use('/roadmaps', roadmapRoutes); 
app.use('/students', studentRouter);
app.use('/categories', categoryRoutes);
app.use('/topic', topicRoutes);
app.use('/vocabs', vocabRoutes);
app.use('/ai', aiRoutes);
app.use('/personal-learning', personalLearningRoutes);
app.use('/workspace', wordspaceRoutes);
app.use('/exercises', exerciseRoutes);
app.use('/user-exercise-results', userExerciseResultRoutes);
app.use('/reports', reportRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: '/swagger.json' 
  }
}));

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});


db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully'))
  .catch((err) => console.error('❌ MySQL connection failed:', err));

module.exports = app;
