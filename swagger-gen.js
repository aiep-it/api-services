const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'My API',
    description: 'Automatically generated docs',
  },
  host: 'https://dxri5rqql2ood.cloudfront.net/api',
  schemes: ['http'],
};

const outputFile = './swagger.json';
const endpointsFiles = ['./src/routers/*.js']; // hoặc glob pattern

swaggerAutogen(outputFile, endpointsFiles, doc);