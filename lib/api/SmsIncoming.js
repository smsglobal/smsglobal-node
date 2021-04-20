const axios = require('../client');
const ajv = require('../validator');
const errors = require('../errors');
const uri = '/sms-incoming';

/**
 * @function dedicatedNumber
 * @param  {function} callback
 */
const deleteIncomingSms = function (id, callback) {
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  if (ajv.validate('#identity', id)) {
    axios
      .delete(`${uri}/${id}`)
      .then((response) => {
        callback('', {
          statusCode: response.status,
          status: response.statusText,
        });
      })
      .catch((error) => {
        if (typeof error !== 'object' || typeof error.response === 'undefined' || typeof error.response.status === 'undefined') {
          return callback(error);
        }
        callback({
          statusCode: error.response.status,
          status: error.response.statusText,
        });
      });
  } else {
    callback(ajv.errorsText(ajv.errors));
  }

  // return the promise if no callback specified
  return promise;
};

/**
 * @function getAll
 * @param {object} options optional
 * @param {function} callback
 */
const getAll = function (options, callback) {

  // keep it like api and dont force user to send an empty object with callback
  if (arguments.length === 1 && typeof options === 'function') {
    callback = options;
  }

  // prevent mutation of given data
  const _options = Object.assign({}, options);

  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  // validate optional parameters
  if (_options && ajv.validate('#sms-incoming/getAll', _options) == false) {
    callback(ajv.errorsText(ajv.errors));
    return promise;
  }

  // validaton: maximum offset + limit <= 10,000
  if (_options.offset) {
    // use default limit value if not set
    if (_options.offset + (_options.limit || 20) > 10000) {
      callback(errors.searchOffsetLimit);
      return promise;
    }
  }

  axios
    .get(uri, {
      params: _options,
    })
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
      const errorResponse = {
        statusCode: error.response.status,
        status: error.response.statusText,
        data: error.response.data,
      };
      callback(errorResponse);
    });

  // return the promise if no callback specified
  return promise;
};

/**
/**
 * @function get
 * @param  {integer} id sms id or outgoing id
 * @param {function} callback
 */
const get = function (id, callback) {
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  if (ajv.validate('#identity', id)) {
    axios
      .get(`${uri}/${id}`)
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
        callback({
          statusCode: error.response.status,
          status: error.response.statusText,
        });
      });
  } else {
    callback(ajv.errorsText(ajv.errors));
  }

  // return the promise if no callback specified
  return promise;
};

module.exports = {
  get,
  getAll,
  delete: deleteIncomingSms,
};
