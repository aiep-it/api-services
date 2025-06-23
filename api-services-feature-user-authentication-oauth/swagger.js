const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Authentication API",
      version: "1.0.0",
      description: "API xác thực người dùng với Clerk + JWT + RBAC",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            clerkId: { type: "string" },
            email: { type: "string", format: "email" },
            firstName: { type: "string", nullable: true },
            lastName: { type: "string", nullable: true },
            role: {
              type: "string",
              enum: ["user", "admin", "staff"],
              nullable: true
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          },
          required: ["id", "clerkId", "email", "role", "createdAt", "updatedAt"]
        },
        UpdateUserRequest: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: {
              type: "string",
              enum: ["user", "admin", "staff"]
            }
          },
          required: []
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            type: { type: "string" },
            description: { type: "string", nullable: true },
            order: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" }
          },
          required: ["id", "name", "type", "created_at", "updated_at"]
        },
        Roadmap: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            type: { type: "string" },
            isNew: { type: "boolean" },
            is_deleted: { type: "boolean" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            categoryId: { type: "string" },
            progressPercentage: { type: "number", format: "float", nullable: true },
            isBookmarked: { type: "boolean", nullable: true }
          },
          required: ["id", "name", "type", "categoryId", "created_at", "updated_at"]
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.join(__dirname, "./src/routers/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
