const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'My API',
    description: 'Automatically generated docs',
  },
  host: '/api',
  schemes: ['http'],
};

const outputFile = './swagger.json';
const endpointsFiles = ['./src/routers/*.js']; // hoặc glob pattern

swaggerAutogen(outputFile, endpointsFiles, doc);