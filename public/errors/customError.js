class CustomError extends Error {
    constructor(message, statusCode, isConfigError = true) {
        super(message);
        this.statusCode = statusCode;
        this.isConfigError = isConfigError;
    }
}
module.exports = CustomError;