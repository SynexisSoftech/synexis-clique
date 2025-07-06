import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  swaggerOptions: {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Clique API Documentation',
        version: '1.0.0',
        description: 'API documentation for Clique e-commerce platform',
      },
      servers: [
        {
          url: process.env.API_BASE_URL || 'http://localhost:3001/api', // Ensure this matches your actual API base URL
          description: 'Development server',
        },
      ],
    },
    apis: ['./src/routes/*.ts'],
  },
};

const swaggerSpec = swaggerJsDoc(options.swaggerOptions);
console.log('>>>> START GENERATED SWAGGER SPEC <<<<');
console.log(JSON.stringify(swaggerSpec, null, 2));
console.log('>>>> END GENERATED SWAGGER SPEC <<<<');
// Add this line to inspect the generated spec
console.log('Generated Swagger Spec:', JSON.stringify(swaggerSpec, null, 2));

export const setupSwagger = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger UI available at /api-docs'); // Confirm setup
};