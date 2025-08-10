const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'My API',
    description: 'Automatically generated docs',
  },
  host: '/api',
  schemes: ['http'],
  securityDefinitions: {
    BearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Bearer token'
    }
  },
  definitions: {
    Class: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        code: { type: 'string' },
        description: { type: 'string' },
        level: { type: 'string', enum: ['STARTERS', 'MOVERS', 'FLYERS'] },
        teachers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              fullName: { type: 'string' },
              email: { type: 'string' }
            }
          }
        },
        roadmaps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              topics: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    image: { type: 'string' },
                    description: { type: 'string' },
                    progress: {
                      type: 'object',
                      properties: {
                        totalVocabs: { type: 'integer' },
                        learnedVocabs: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        students: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              fullName: { type: 'string' },
                            email: { type: 'string' }
            }
          }
        }
      }
    },
    ClassInfoWithRole: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        code: { type: 'string' },
        description: { type: 'string' },
        level: { type: 'string', enum: ['STARTERS', 'MOVERS', 'FLYERS'] },
        role: { type: 'string', enum: ['TEACHER', 'STUDENT'] }
      }
    },
    CreateClassRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        code: { type: 'string' },
        description: { type: 'string' },
        level: { type: 'string', enum: ['STARTERS', 'MOVERS', 'FLYERS'] },
        teacherIds: { type: 'array', items: { type: 'string' } },
        roadmapIds: { type: 'array', items: { type: 'string' } }
      },
      required: ['name', 'code', 'level']
    },
    UpdateClassRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        code: { type: 'string' },
        description: { type: 'string' },
        level: { type: 'string', enum: ['STARTERS', 'MOVERS', 'FLYERS'] }
      }
    },
    CreateStudentRequest: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', description: 'Student\'s email address' },
        password: { type: 'string', description: 'Student\'s password (default: \"123456\" if not provided)' },
        firstName: { type: 'string', description: 'Student\'s first name' },
        lastName: { type: 'string', description: 'Student\'s last name' },
        fullName: { type: 'string', description: 'Student\'s full name' },
        username: { type: 'string', description: 'Student\'s username (generated if not provided)' },
        parentName: { type: 'string', description: 'Parent\'s full name' },
        parentPhone: { type: 'string', description: 'Parent\'s phone number' },
        address: { type: 'string', description: 'Student\'s address' },
      },
      required: ['email', 'fullName'],
    },
    CreateStudentResponse: {
      type: 'object',
      properties: {
        clerkId: { type: 'string', description: 'The ID of the user in Clerk' },
        username: { type: 'string', description: 'The generated or provided username' },
        password: { type: 'string', description: 'The password used for the student' },
        message: { type: 'string', description: 'Confirmation message' },
      },
    },
    BulkImportStudentsResponse: {
      type: 'object',
      properties: {
        count: { type: 'integer', description: 'Number of students successfully created' },
        students: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              clerkId: { type: 'string', description: 'The ID of the user in Clerk' },
              username: { type: 'string', description: 'The generated or provided username' },
              password: { type: 'string', description: 'The password used for the student' },
              fullName: { type: 'string', description: 'The full name of the student' },
            },
          },
        },
      },
    }
  }
};

const outputFile = './swagger.json';
const endpointsFiles = ['./src/routers/*.js', './src/controllers/**/*.js']; // hoặc glob pattern

swaggerAutogen(outputFile, endpointsFiles, doc);