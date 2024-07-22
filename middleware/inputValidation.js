const ValidationError = require('../public/errors/validationError');
module.exports = function handleErrorsAsync(fn, schema) {
    return async (req, res, next) => {
        try {
            if (schema != null) {
                const tempSchema = await schema();
                const { error } = await tempSchema.validate((req.body && Object.keys(req.body).length !== 0) ? req.body : req.query);
                if (error) {
                    // Handle validation errors
                    throw new ValidationError(error.details[0].message, error.details[0].type, 400, true);
                }
            }
            await fn(req, res, next); // Execute the wrapped function
        } catch (error) {
            next(error); // Pass any caught errors to the next middleware
        }
    };
}