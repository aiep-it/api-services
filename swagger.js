// swagger.js
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Next.js API Docs",
      version: "1.0.0",
      description: "Auto-generated API docs for Next.js",
    },
  },
  apis: ["./pages/api/**/*.ts", "./pages/api/**/*.js"], // đường dẫn chứa route cần gen docs
};

const swaggerSpec = swaggerJsDoc(options);
module.exports = swaggerSpec;
