'use strict';
const Actuator = require('express-actuator');
const CookieParser = require('cookie-parser');
const Express = require('express');
const Path = require('path');
const FS = require('fs');
const Logger = require('morgan');
const Utils = require("./public/utils.js");
const CustomError = require('./public/errors/customError.js');
const ResponseBodyGenerator = require('./public/responseBodyGenerator.js');
const RegexConfig = require('./public/constants/regexConfig.js');
const ApiRoutes = require('./middleware/apiRoute.js');
const handleErrorsAsync = require('./middleware/inputValidation.js');
const ValidationError = require('./public/errors/validationError.js');
const sprintf = require('sprintf-js').sprintf;
const { createSwaggerPath, createSwaggerDocument, saveSwaggerDocument } = require('./swagger/swaggerUtils');
const { successResponse, errorResponse } = require('./middleware/responseMiddleware.js');
var app = Express();
var accessLogStream = FS.createWriteStream(Path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(Logger('combined', { stream: accessLogStream }))
app.use(Express.json({ limit: '100gb' }));
app.use(Express.urlencoded());
app.use(CookieParser());
app.use(Express.static(Path.join(__dirname, 'public')));
app.use(Actuator());

RegexConfig.initialize();
RegexConfig.addListener((propertyName, value) => console.log(`Property ${propertyName} changed to:`, value));


// Apply response middleware
app.use(successResponse);
app.use(errorResponse);

app.use(function (req, res, next) {
    try {
        const xRequestID = req.headers['x-request-id'];
        const token = req.headers['token'];
        console.log(`[${new Date().toISOString()}][CosmosDBRestAPI][AppStart][DEBUG]: xRequestID = ${xRequestID}, PDNGTranID = ${token}`);

        if (xRequestID == undefined || xRequestID == null || xRequestID == "") {
            //TODO do the autnetication here
        }
        if (token == undefined || token == null || token == "") {
            //TODO do the autnetication here
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Loop through the apiRoutes array and attach routes with error handling
const router = Express.Router(); // Initialize router
const paths = {};

const attachRoutes = (routes) => {
    console.log(`[${new Date().toISOString()}][CosmosDBRestAPI][AppStart][DEBUG]: Attaching routes...`);

    routes.forEach(async ({ method, path, controller, schema }) => {
        router[method](path, handleErrorsAsync(controller, schema));

        const swaggerPath = await createSwaggerPath(path, method, schema);
        Object.assign(paths, swaggerPath);

        const swaggerDocument = createSwaggerDocument(paths);
        saveSwaggerDocument(swaggerDocument, './../swagger.json');
    });
};

attachRoutes(ApiRoutes);

FS.watchFile(RegexConfig.path, (filename, eventType) => {
    console.log(`[${new Date().toISOString()}][CosmosDBRestAPI][AppStart][DEBUG]: File ${filename} changed. Reloading...`);
    RegexConfig.initialize();
    console.log(`[${new Date().toISOString()}][CosmosDBRestAPI][AppStart][DEBUG]: RegMapping: ${JSON.stringify(RegexConfig.regMapping)}`);
    router.stack = []; // Remove all routes
    attachRoutes(ApiRoutes); // Re-attach the routes
});
app.use(router);

// Error handling middleware
app.use(async (e, req, res, next) => {
    // Log the error for debugging purposes
    const response = new ResponseBodyGenerator("", req.method + " " + req.originalUrl);
    if (e instanceof CustomError) {
        let message;
        if (e.isConfigError)
            message = await response.errorResponseBody(e.message)
        else
            message = e.message;
        await Utils.Logger("ErrorHandlingMiddleware", Utils.LogLevel.Error, JSON.stringify(message));
        res.error(e.statusCode, e.errorCode, e.message);
    } else if (e instanceof ValidationError) {
        // process validation error as error handler
        console.log(`[${new Date().toISOString()}][CosmosDBRestAPI][AppStart][DEBUG]: Validation error: ${e.errorType}`);
        let responseBody = {};
        if (e.errorType == "string.pattern.base")
            responseBody = await response.errorResponseBody("90029");
        else if (e.errorType == "any.required")
            responseBody = await response.errorResponseBody("90030");
        else if (e.errorType == "date.format")  // date format error
            responseBody = await response.errorResponseBody("90031");
        else if (e.errorType == "any.EFDtGtEOLDt")  // date error
            responseBody = await response.errorResponseBody("90031");
        else if (e.errorType == "any.EXDtLtEOLDt")  // date error
            responseBody = await response.errorResponseBody("90032");
        else if (e.errorType == "any.unknown")  // other error
            responseBody = await response.errorResponseBody("90033");
        else if (e.errorType == "array.max") {
            responseBody = await response.errorResponseBody("90051");
            responseBody.Suggestion = sprintf(responseBody.Suggestion, e.message);
        }
        else {
            responseBody = await response.errorResponseBody("90028");
            responseBody.Suggestion = sprintf(responseBody.Suggestion, e.errorType.split('.')[0]);
        }

        responseBody.Message = sprintf(responseBody.Message, e.message);
        await Utils.Logger("ErrorHandlingMiddleware", Utils.LogLevel.Error, JSON.stringify(responseBody));
        res.error(400, null, responseBody);
    } else {
        let body = await response.errorResponseBody(e.message);
        await Utils.Logger("ErrorHandlingMiddleware", Utils.LogLevel.Error, JSON.stringify(body));
        res.error(500, null, e.message);
    }
});


let httpPort = 3000;
let serverhttp = require('http').Server(app);
serverhttp.keepAliveTimeout = 120 * 1000;
serverhttp.headersTimeout = 125 * 1000;

serverhttp.listen(httpPort, async function () {
    let appVersion = await Utils.GetAppVersion();
    console.log(`[${new Date().toISOString()}][CosmosDBRestAPI][AppStart][DEBUG]: API server is listening on port ${httpPort}. Application name and version: CosmosDBRestAPI-${appVersion}\n`);
});

module.exports.tracer = function () { return { "PDNGTranID": PDNGTranID, "xRequestID": xRequestID }; };
module.exports = app;