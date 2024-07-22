const ResponseBodyGenerator = require('../public/responseBodyGenerator');

function successResponse(req, res, next) {
    res.success = function (message, result) {
        const responseGenerator = new ResponseBodyGenerator(message, req.originalUrl);
        const responseBody = responseGenerator.successResponseBody(result);
        res.status(200).json(responseBody);
    };
    next();
}

function errorResponse(req, res, next) {
    res.error = async function (statusCode, errorCode, message = null) {
        const responseGenerator = new ResponseBodyGenerator(message || 'Error occurred', req.originalUrl);
        const responseBody = await responseGenerator.errorResponseBody(errorCode);
        res.status(statusCode).json(responseBody);
    };
    next();
}

module.exports = {
    successResponse,
    errorResponse
};
