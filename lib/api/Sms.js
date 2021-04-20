const axios = require('../client');
const errors = require('../errors');
const uri = '/sms';
const ajv = require('../validator');

/**
 * Send a sms request
 *
 * @function send
 * @param  {object} data
 * @param {function} callback
 */
const send = function (data, callback) {
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

  if (Object.keys(_data).length == 0) {
    callback(Error(errors.sms.missingData));
    return promise;
  }

  // return validation errors
  if (ajv.validate('#sms/send', _data) === false) {
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
      const errorResponse = {
        statusCode: error.response.status,
        status: error.response.statusText,
      };

      // Bad request errors
      if (error.response.status == 400) {
        Object.assign(errorResponse, { data: error.response.data });
      }

      callback(errorResponse);
    });

  // return the promise if no callback specified
  return promise;
};

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

/**
 * @function getAll
 * @param  {object} options optional
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
      callback = function (error, result) {
        error ? rej(error) : res(result);
      };
    });
  }

  // validate optional parameters
  if (_options && ajv.validate('#sms/getAll', _options) == false) {
    callback(ajv.errorsText(ajv.errors));
    return promise;
  }

  // TODO: Move to validor module
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
      callback({
        statusCode: error.response.status,
        status: error.response.statusText,
      });
    });
  // return the promise if no callback specified
  return promise;
};
/*
/**
 * @function deleteSms
 * @param  {integer} id outgoing_id
 * @param {function} callback
 */
const deleteSms = function (id, callback) {
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

module.exports = {
  send,
  get,
  getAll,
  delete: deleteSms,
  incoming: require('./SmsIncoming'),
};
