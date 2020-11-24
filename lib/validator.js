const Ajv = require('ajv');
const schema = require('./schema');
const luxon = require('luxon');

const ajv = new Ajv({
  allErrors: true,
  schemas: schema,
});

// date time formatter and mutate given json schema
ajv.addKeyword('dateTimeFormat', {
  modifying: true,
  errors: true,
  validate: function validator(schema, data) {

    validator.errors = [{keyword: 'dateTimeFormat', message: `shoud be a valid date time string (${schema})`, params: {keyword: 'dateTimeFormat'}}];

    // validate data and convert into given as format
    return typeof data === 'string' && luxon.DateTime.fromFormat(data, schema).isValid;

  },
});

module.exports = ajv;
