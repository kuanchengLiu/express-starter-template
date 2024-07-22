const Joi = require('joi');
const RegexConfig = require('../../public/constants/regexConfig.js');

module.exports = function getSchemaForField(fieldName, type, isRequired = true) {
    for (let [regExpKey, fields] of Object.entries(RegexConfig.regMapping)) {
        if (fields.includes(fieldName)) {
            let schema = type === "string" ?
                Joi[type]().pattern(new RegExp(RegexConfig.regularExpressions[regExpKey])) :
                Joi[type]().options({ convert: false });
            return isRequired
                ? schema.required()
                : schema.allow(null, '');
        }
    }
    return isRequired ? Joi.any().required() : Joi.any().allow(null, ''); // default schema if no match found
}
