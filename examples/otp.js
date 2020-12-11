const smsglobal = require('smsglobal')();
const util = require('util');

// To send an OTP request
var payload = {
  origin: 'SMSGlobal',
  message: '{*code*} is your SMSGlobal verification code.',
  destination: '61400000000',
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
smsglobal.otp.verifyByRequestId('request Id', 'OTP code').then((response) => {
  console.log('Success:', response);
}).catch((err) => {
  console.error('Error:', err);
});


// To cancel an OTP request by using destination number
smsglobal.otp.cancelByDestination('destintion number').then((response) => {
  console.log('Success:', response);
}).catch((err) => {
  console.error('Error:', err);
});
