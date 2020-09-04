
const SMSGLOBAL_API_KEY = 'YOUR API KEY';
const SMSGLOBAL_API_SECRET = 'YOUR API SECRET';
const smsglobal = require('../lib')(SMSGLOBAL_API_KEY, SMSGLOBAL_API_SECRET);
const util = require('util');

// Send sms
var payload = {
  origin: 'NodeSdk',
  scheduledDateTime: '0474950859',
  message: 'Test sms from node sdk',
};

smsglobal.sms.send(payload, function(error, response) {

  if (response) {
    console.log('Response:', response.data ? response.data : response);
  }

  if (error) {
    console.log('Error:', util.inspect(error, {showHidden: false, depth: null, colors: true}));
  }

});


// fetch a list of outgoing sms
var options = {
  offset: 1,
  limit: 50,
};

smsglobal.sms.getAll(options)
  .then((response) => {
    console.log('Success:', response);
  }).catch((err) => {
    console.error('Error:', err);
  });


// fetch a list of incoming sms
smsglobal.sms.incoming.getAll(function(error, response) {

  if (response) {
    console.log('Response:', response.data ? response.data : response);
  }

  if (error) {
    console.log('Error:', util.inspect(error, {showHidden: false, depth: null, colors: true}));
  }
});
