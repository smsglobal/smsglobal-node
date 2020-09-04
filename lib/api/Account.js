const axios = require('../client');

/**
 * @function autoTopUp
 * @param  {function} callback
 */
const autoTopUp = function (callback) {
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  const uri = '/auto-topup';
  axios
    .get(uri)
    .then((response) => {
      callback('', {
        statusCode: response.status,
        status: response.statusText,
        data: response.data,
      });
    })
    .catch(function (error) {
      callback('', {
        statusCode: error.response.status,
        status: error.response.statusText,
      });
    });

  return promise;
};

/**
 * @function creditBalance
 * @param  {function} callback
 */
const creditBalance = function (callback) {
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  const uri = '/user/credit-balance';
  axios
    .get(uri)
    .then((response) => {
      callback('', {
        statusCode: response.status,
        status: response.statusText,
        data: response.data,
      });
    })
    .catch(function (error) {
      callback('', {
        statusCode: error.response.status,
        status: error.response.statusText,
      });
    });

  return promise;
};

/**
 * @function dedicatedNumber
 * @param  {function} callback
 */
const dedicatedNumber = function (callback) {
  // Setup Promise if no callback specified.
  let promise;

  if (typeof callback !== 'function') {
    promise = new Promise((res, rej) => {
      callback = function (err, result) {
        err ? rej(err) : res(result);
      };
    });
  }

  const uri = '/dedicated-number';
  axios
    .get(uri)
    .then((response) => {
      callback('', {
        statusCode: response.status,
        status: response.statusText,
        data: response.data,
      });
    })
    .catch(function (error) {
      callback('', {
        statusCode: error.response.status,
        status: error.response.statusText,
      });
    });

  return promise;
};

module.exports = {
  autoTopUp: autoTopUp,
  creditBalance: creditBalance,
  dedicatedNumber: dedicatedNumber,
};
