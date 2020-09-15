module.exports = {
  host: 'https://api.smsglobal.com/v2',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `SMSGlobal-SDK/v2 Version/1.0.0 Node/${process.version} (${process.platform} ${process.arch}; OpenSSL/${process.versions.openssl})`,
  },
};
