const Joi = require('joi');
const SchemaValidator = require('../../public/library/schemaValidation.js');

const addPML2Schema = () => {
    return Joi.object({
        Role: SchemaValidator('Role', "string").example("L2"),
        Fullname: SchemaValidator('Fullname', "string").example("Said Santana"),
        Email: SchemaValidator('Email', "string").example("said.santana@hp.com"),
        MGREmail: SchemaValidator('MGREmail', "string").example("albert.fan@hp.com"),
        UpdatedBy: SchemaValidator('UpdatedBy', "string", false).example("SaSa")
    })
};

module.exports = addPML2Schema;