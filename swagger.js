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
    components: {
      schemas: {
        Topic: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
          },
        },
        Vocab: {
          type: 'object',
          properties: {
            word: {
              type: 'string',
            },
            meaning: {
              type: 'string',
            },
            example: {
              type: 'string',
            },
            imageUrl: {
              type: 'string',
            },
            audioUrl: {
              type: 'string',
            },
          },
        },
        MultipleVocabs: {
          type: 'object',
          properties: {
            vocabs: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Vocab',
              },
            },
          },
        },
        TopicWithVocabs: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            Vocab: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Vocab',
              },
            },
          },
        },
        Wordspace: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            isWordSpace: {
              type: 'boolean',
            },
            topics: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TopicWithVocabs',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
