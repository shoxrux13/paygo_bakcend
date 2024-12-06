const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Node.js API with Swagger',
        version: '1.0.0',
        description: 'API Documentation with Swagger',
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Local server',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'], // Yo'llarni ko'rsating (API-lar joylashuvi)
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
