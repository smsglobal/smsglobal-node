/**
 * @constructor Smsglobal
 *
 * @param  {string} key smsglobal api key
 * @param  {string} secret smsglobal api secret
 */
const Smsglobal = function (key, secret) {
  if (!(this instanceof Smsglobal)) {
    return new Smsglobal(key, secret);
  }

  this.key = key || process.env.SMSGLOBAL_API_KEY;
  this.secret = secret || process.env.SMSGLOBAL_API_SECRET;

  // TODO: Remove env variable and create client with credentials
  if (key && secret) {
    process.env['SMSGLOBAL_API_KEY'] = key;
    process.env['SMSGLOBAL_API_SECRET'] = secret;
  }

  // check if credetials not supplier in constructor
  if (this.key === undefined || this.secret === undefined) {
    throw new Error('api key and secret are both required parameters.');
  }
};

Smsglobal.prototype.sms = require('./api/Sms');
module.exports = Smsglobal;
