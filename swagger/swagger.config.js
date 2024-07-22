// swaggerConfig.js
module.exports = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Express starter template API',
            version: '07.00.00.00',
            description: 'The API documentation for quickly building RESTful APIs using Node.js and Express.',
            contact: {
                name: 'Tommy Liu',
                email: 'tommyliu0108@gmail.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api/',
            },
        ],
    }
};
