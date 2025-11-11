const axios = require('../client');
const uri = '/otp';
const errors = require('../errors');
const AjvLib = require('ajv');
const Ajv = AjvLib.default || AjvLib;
const addErrors = require('ajv-errors');
const { DateTime } = require('luxon');
const schemas = require('../schema');

const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true,
});

function formatAjvErrors(errs) {
  if (!Array.isArray(errs) || errs.length === 0) {
    return '';
  }

  return errs
    .map((e) => {
      // instancePath like "/id" -> ".id"; keep "data" prefix
      const dotPath =
        'data' + (e.instancePath ? e.instancePath.replace(/\//g, '.').replace(/^\.*/, '.') : '');
      // e.message already contains our ajv-errors custom text like "should be string"
      return `${dotPath} ${e.message}`;
    })
    .join(', ');
}

addErrors(ajv);

ajv.addSchema(schemas);

ajv.addKeyword({
  keyword: 'dateTimeFormat',
  type: ['string', 'object'],
  errors: true,
  compile(expectedFormat) {
    return function (data) {
      if (data == null) {
        return true;
      }
      if (typeof data !== 'string') {
        return true;
      }
      const parsed = DateTime.fromFormat(data, expectedFormat);

      return parsed.isValid;
    };
  },
});

module.exports = ajv;

/**
 * Send an OTP request
 * @function send
 *
 * @param {object} data
 * @param {function} callback
 */
const send = function name(data, callback) {
  // prevent mutation of given data
  const _data = Object.assign({}, data);
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  if (Object.keys(_data).length === 0) {
    callback(Error(errors.otp.missingData));
    return promise;
  }

  // return validation errors
  if (ajv.validate('#otp/send', _data) === false) {
    callback(ajv.errorsText(ajv.errors));
    return promise;
  }

  axios
    .post(uri, _data)
    .then((response) => {
      callback('', {
        statusCode: response.status,
        status: response.statusText,
        data: response.data,
      });
    })
    .catch((error) => {
      if (typeof error !== 'object' || typeof error.response === 'undefined' || typeof error.response.status === 'undefined') {
        return callback(error);
      }
      let errorResponse = {
        statusCode: error.response.status,
        status: error.response.statusText,
      };

      // Bad request errors
      if (error.response.status === 400) {
        Object.assign(errorResponse, { data: error.response.data });
      }

      callback(errorResponse);
    });

  // return the promise if no callback specified
  return promise;
};

/**
 * Send an OTP verification request by using request Id
 *
 * @function verify
 * @param  {string} id requestId received upon sending an OTP
 * @param code
 * @param {function} callback
 */
const verifyByRequestId = function (id, code, callback) {
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  if (ajv.validate('#otp/verify-with-id', {id: id, code: code}) === false) {
    callback(formatAjvErrors(ajv.errors));

    // return the promise if no callback specified
    return promise;
  }

  axios
    .post(`${uri}/requestid/${id}/validate`, {code: code})
    .then((response) => {
      callback('', {
        statusCode: response.status,
        status: response.statusText,
        data: response.data,
      });
    })
    .catch((error) => {
      if (typeof error !== 'object' || typeof error.response === 'undefined' || typeof error.response.status === 'undefined') {
        return callback(error);
      }
      let errorResponse = {
        statusCode: error.response.status,
        status: error.response.statusText,
      };

      // Bad request errors
      if (error.response.status === 400) {
        Object.assign(errorResponse, { data: error.response.data });
      }

      callback(errorResponse);
    });

  // return the promise if no callback specified
  return promise;
};

/**
 * Send an OTP verification request by using destination number
 *
 * @function verify
 * @param  {string} destination destination number
 * @param code
 * @param {function} callback
 */
const verifyByDestination = function (destination, code, callback) {
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  if (ajv.validate('#otp/verify-with-destination', {destination: destination, code: code}) === false) {
    callback(formatAjvErrors(ajv.errors));

    // return the promise if no callback specified
    return promise;
  }

  axios
    .post(`${uri}/${destination}/validate`, {code: code})
    .then((response) => {
      callback('', {
        statusCode: response.status,
        status: response.statusText,
        data: response.data,
      });
    })
    .catch((error) => {
      if (typeof error !== 'object' || typeof error.response === 'undefined' || typeof error.response.status === 'undefined') {
        return callback(error);
      }
      let errorResponse = {
        statusCode: error.response.status,
        status: error.response.statusText,
      };

      // Bad request errors
      if (error.response.status === 400) {
        Object.assign(errorResponse, { data: error.response.data });
      }

      callback(errorResponse);
    });

  // return the promise if no callback specified
  return promise;
};

/**
 * Cancel an OTP request by using request ID
 *
 * @function cancel
 * @param  {string} id requestId received upon sending an OTP
 * @param {function} callback
 */
const cancelByRequestId = function (id, callback) {
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  if (ajv.validate('#identityString', id) === false) {
    callback(errors.otp.id);
    // return the promise if no callback specified
    return promise;
  }

  axios
    .post(`${uri}/requestid/${id}/cancel`)
    .then((response) => {
      callback('', {
        statusCode: response.status,
        status: response.statusText,
        data: response.data,
      });
    })
    .catch((error) => {
      if (typeof error !== 'object' || typeof error.response === 'undefined' || typeof error.response.status === 'undefined') {
        return callback(error);
      }
      let errorResponse = {
        statusCode: error.response.status,
        status: error.response.statusText,
      };

      callback(errorResponse);
    });

  // return the promise if no callback specified
  return promise;
};

/**
 * Cancel an OTP request by using destination number
 *
 * @function cancel
 * @param  {string} destination destination number
 * @param {function} callback
 */
const cancelByDestination = function (destination, callback) {
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  if (ajv.validate('#identityString', destination) === false) {
    callback(errors.otp.destination);
    // return the promise if no callback specified
    return promise;
  }

  axios
    .post(`${uri}/${destination}/cancel`)
    .then((response) => {
      callback('', {
        statusCode: response.status,
        status: response.statusText,
        data: response.data,
      });
    })
    .catch((error) => {
      let errorResponse = {
        statusCode: error.response.status,
        status: error.response.statusText,
      };

      callback(errorResponse);
    });

  // return the promise if no callback specified
  return promise;
};

module.exports = {
  send,
  verifyByRequestId,
  verifyByDestination,
  cancelByRequestId,
  cancelByDestination,
};
