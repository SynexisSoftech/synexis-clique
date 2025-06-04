import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clique API', 
      version: '1.0.0',
      description: 'API endpoints for Clique backend', // Update description if needed
    },
    servers: [
      {
        url: 'http://localhost:3001/api', // Ensure this matches your actual API base URL
      },
    ],
    // You can also add your components.schemas definition here globally if preferred
    // components: {
    //   schemas: {
    //     ContactQueryType: { /* ... */ },
    //     // ... other schemas from your contactUs.routes.ts
    //   },
    //   securitySchemes: {
    //      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    //   }
    // }
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsDoc(options);
console.log('>>>> START GENERATED SWAGGER SPEC <<<<');
console.log(JSON.stringify(swaggerSpec, null, 2));
console.log('>>>> END GENERATED SWAGGER SPEC <<<<');
// Add this line to inspect the generated spec
console.log('Generated Swagger Spec:', JSON.stringify(swaggerSpec, null, 2));

export const setupSwagger = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger UI available at /api-docs'); // Confirm setup
};