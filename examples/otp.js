
const SMSGLOBAL_API_KEY = 'YOUR API KEY';
const SMSGLOBAL_API_SECRET = 'YOUR API SECRET';
const smsglobal = require('smsglobal')(SMSGLOBAL_API_KEY, SMSGLOBAL_API_SECRET);
const util = require('util');

// To send an OTP request
var payload = {
  origin: 'NodeSdk',
  message: '{*code*} is your SMSGlobal verification code.',
  destination: '61474950859',
  length: 4,

};

smsglobal.otp.send(payload, function(error, response) {
  if (response) {
    console.log('Response:', response.data ? response.data : response);
  }

  if (error) {
    console.log('Error:', util.inspect(error, {showHidden: false, depth: null, colors: true}));
  }

});


// To verfiy an OTP code entered by your user
smsglobal.otp.verify('404372541681933765870569', '1203').then((response) => {
  console.log('Success:', response);
}).catch((err) => {
  console.error('Error:', err);
});


// To cancel an OTP request
smsglobal.otp.cancel('404372541681933703251703').then((response) => {
  console.log('Success:', response);
}).catch((err) => {
  console.error('Error:', err);
});


// To get an OTP request object
smsglobal.otp.get('404372541681933703251703', function(error, response) {
  if (response) {
    console.log('Response:', response.data ? response.data : response);
  }

  if (error) {
    console.log('Error:', util.inspect(error, {showHidden: false, depth: null, colors: true}));
  }

});

// To get a list of all OTP requests
smsglobal.otp.getAll({ status: 'Verified'}).then((response) => {
  console.log('Success:', response);
}).catch((err) => {
  console.error('Error:', err);
});
