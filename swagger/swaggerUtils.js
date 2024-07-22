// swaggerUtils.js
const FS = require('fs');
const toSwagger = require('joi-to-swagger');
const swaggerConfig = require('./swagger.config');

// Sample response schemas
const sampleResponses = (path, method) => {
    return {
        200: {
            description: "Successful response",
            content: {
                'application/json': {
                    example: {
                        "Endpoint": `${method} ${path}`,
                        "Timestamp": "2024-07-12T06:35:46.507Z",
                        "Message": `[${path}] process successfully`,
                        "Result": {}
                    }
                }
            }
        },
        500: {
            description: "Error response",
            content: {
                'application/json': {
                    example: {
                        "Timestamp": "2024-07-11T06:17:12.008Z",
                        "ErrorCode": "90028",
                        "Endpoint": `${method} ${path}`,
                        "Suggestion": "Please provide a/an object input.",
                        "Message": "INVALID_PARAMETER_TYPE - [example error message]"
                    }
                }
            }
        }
    }
};

const createSwaggerPath = async (path, method, schema) => {
    let swaggerSchema = {};
    if (schema !== null) {
        swaggerSchema = toSwagger(await schema());
    }
    const requestBodyOrParameters = method.toLowerCase() === 'get'
        ? {
            parameters: schema ? [{
                name: 'params',
                in: 'query',
                schema: swaggerSchema.swagger,
                required: true,
                description: 'Query parameters'
            }] : []
        }
        : {
            requestBody: schema ? {
                content: {
                    'application/json': {
                        schema: swaggerSchema.swagger,
                    },
                },
            } : {}
        };
    return {
        [path]: {
            [method]: {
                ...requestBodyOrParameters,
                responses: {
                    ...sampleResponses(path, method)
                },
            },
        },
    };
};

const createSwaggerDocument = (paths) => {
    return {
        ...swaggerConfig.swaggerDefinition,
        paths,
    };
};

const saveSwaggerDocument = (swaggerDocument, filePath) => {
    FS.writeFileSync(filePath, JSON.stringify(swaggerDocument, null, 2));
};

module.exports = {
    createSwaggerPath,
    createSwaggerDocument,
    saveSwaggerDocument
};
