const axios = require('../client');
const ajv = require('../validator');
const uri = '/otp';

const errors = require('../errors');

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

  if (Object.keys(_data).length == 0) {
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
      let errorResponse = {
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
 * @param  {integer} id requestId received upon sending an OTP
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

  if (ajv.validate('#identityString', id) === false) {
    callback(errors.otp.id);

    // return the promise if no callback specified
    return promise;
  }

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
      callback({
        statusCode: error.response.status,
        status: error.response.statusText,
      });
    });


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
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  // validate optional parameters
  if (_options && ajv.validate('#otp/getAll', _options) == false) {
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
 * Send an OTP verification request
 *
 * @function verify
 * @param  {integer} id requestId received upon sending an OTP
 * @param {function} callback
 */
const verify = function (id, code, callback) {
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  if (typeof code === 'undefined') {
    callback(errors.otp.code);

    // return the promise if no callback specified
    return promise;
  }

  if (ajv.validate('#otp/verify', {id: id, code: code}) === false) {
    callback(ajv.errorsText(ajv.errors));

    // return the promise if no callback specified
    return promise;
  }

  axios
    .post(`${uri}/${id}`, {code: code})
    .then((response) => {
      callback('', {
        statusCode: response.status,
        status: response.statusText,
      });
    })
    .catch((error) => {
      const errorResponse = {
        statusCode: error.response.status,
        status: error.response.statusText,
      };

      // Bad request errors
      if ([400, 409].includes(error.response.status)) {
        Object.assign(errorResponse, { data: error.response.data });
      }

      callback(errorResponse);
    });


  // return the promise if no callback specified
  return promise;
};


/**
 * Cancel an OTP request
 *
 * @function cancel
 * @param  {integer} id requestId received upon sending an OTP
 * @param {function} callback
 */
const cancel = function (id, callback) {

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
    .put(`${uri}/${id}/cancel`)
    .then((response) => {
      callback('', {
        statusCode: response.status,
        status: response.statusText,
      });
    })
    .catch((error) => {
      let errorResponse = {
        statusCode: error.response.status,
        status: error.response.statusText,
      };
      // Bad request errors
      if (error.response.status === 409) {
        Object.assign(errorResponse, { data: error.response.data });
      }

      callback(errorResponse);
    });


  // return the promise if no callback specified
  return promise;
};


module.exports = {
  send,
  get,
  getAll,
  verify,
  cancel,
};
