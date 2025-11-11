// client side validation errors other than json schema validator

module.exports = {
  smsglobal: 'api key and secret are both required parameters.',
  otp: {
    id: 'id should be a string.',
    missingData: 'OTP data is required',
    destination: 'destination number should be string',
  },
  searchOffsetLimit: 'offset and limit (default 20) total can not exceed 10000.',
  sms: {
    missingData: 'sms data not provided.',
  },
};
