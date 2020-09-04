module.exports = {
  host: 'https://api.smsglobal.com/v2',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent':
      'Smsglobal-Node-SDK/1.0  (node ' +
      process.version +
      ') platform (' +
      process.arch +
      '-' +
      process.platform +
      '; OpenSSL ' +
      process.versions.openssl +
      ')',
  },
};
