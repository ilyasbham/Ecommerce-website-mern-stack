const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce API Documentation",
      version: "1.0.0",
      description:
        "REST API documentation for the Ecommerce project including authentication and product features.",
      contact: {
        name: "zin ko ko latt",
        email: "ilyasbham1@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1/swagger", // backend base URL
      },
    ],
  },
  // These files will be scanned for Swagger JSDoc comments
  apis: ["./controllers/*.js", "./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("✅ Swagger Docs running on http://localhost:5000/api-docs");
};

module.exports = swaggerDocs;
