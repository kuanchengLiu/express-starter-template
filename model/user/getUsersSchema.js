const Joi = require('joi');
const SchemaValidator = require('../../public/library/schemaValidation.js');

const getUsersSchema = () => {
    return Joi.object({
        Role: SchemaValidator('Role', "string").example("L2")
    })
};

module.exports = getUsersSchema;