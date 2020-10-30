const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
const url = require('url');
const sdkConfig = require('./config');

var axiosInstance = axios.create({
  baseURL: sdkConfig.host,
  /* other custom settings */
});

axiosInstance.interceptors.request.use((config) => {
  let urlString = config.baseURL + config.url;

  // append params to the url
  if (config.params && Object.keys(config.params).length > 0) {
    urlString += `?${querystring.stringify(config.params)}`;
  }

  // parse url
  const urlFragments = url.parse(urlString);

  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.floor(Math.random() * 10000000);
  const port = urlFragments.protocol == 'https:' ? 443 : 80;
  const auth = `${timestamp}\n${nonce}\n${config.method.toUpperCase()}\n${urlFragments.path}\n${urlFragments.host}\n${port}\n\n`;
  const hash = crypto
    .createHmac('sha256', process.env.SMSGLOBAL_API_SECRET)
    .update(auth)
    .digest('base64');
  const token = `MAC id="${process.env.SMSGLOBAL_API_KEY}", ts="${timestamp}", nonce="${nonce}", mac="${hash}"`;
  Object.assign(
    config.headers,
    {
      Authorization: token,
    },
    sdkConfig.headers,
  );

  return config;
});

module.exports = axiosInstance;
