class ValidationError extends Error {
    constructor(message, errorType, statusCode = 400, isConfigError = true) {
        super(message);
        this.errorType = errorType;
        this.statusCode = statusCode;
        this.isConfigError = isConfigError;
    }
}

module.exports = ValidationError;