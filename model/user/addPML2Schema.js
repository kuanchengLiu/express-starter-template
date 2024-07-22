const Joi = require('joi');
const SchemaValidator = require('../../public/library/schemaValidation.js');

const addPML2Schema = () => {
    return Joi.object({
        Role: SchemaValidator('Role', "string").example("L2"),
        Fullname: SchemaValidator('Fullname', "string").example("User Name"),
        Email: SchemaValidator('Email', "string").example("user.name@hp.com"),
        MGREmail: SchemaValidator('MGREmail', "string").example("abc.def@hp.com"),
        CreatedBy: SchemaValidator('CreatedBy', "string").example("SaSa"),
        UpdatedDt: SchemaValidator('UpdatedDt', "string", false),
        CreatedDt: SchemaValidator('CreatedDt', "string", false),
        UpdatedBy: SchemaValidator('UpdatedBy', "string", false)
    })
};

module.exports = addPML2Schema;