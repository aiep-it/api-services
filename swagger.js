// swagger.js
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API Documentation',
      version: '1.0.0',
      description: 'REST API docs using Swagger in Node.js',
    },
    servers: [
      {
        url: '/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
