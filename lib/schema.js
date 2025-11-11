const dateTimeFormat = 'yyyy-MM-dd HH:mm:ss';

module.exports = [
  {
    $id: '#identity',
    type: ['integer', 'string'],
  },
  {
    $id: '#identityString',
    type: ['string'],
  },
  {
    $id: '#sms/send',
    type: 'object',
    additionalProperties: false,
    properties: {
      origin: {
        type: ['null', 'string'],
        minLength: 3,
        maxLength: 15,
      },
      destination: {
        type: ['string'],
        minLength: 3,
        maxLength: 15,
      },
      destinations: {
        type: 'array',
        items: {
          type: ['string'],
          minLength: 3,
          maxLength: 15,
        },
      },
      message: { type: 'string' },
      scheduledDateTime: {
        type: ['object', 'string'],
        dateTimeFormat: dateTimeFormat,
      },
      expiryDateTime: {

        type: ['string', 'object'],
        dateTimeFormat: dateTimeFormat,
      },
      campaign: {
        type: ['string', 'object'],
        dateTimeFormat: dateTimeFormat,
      },
      sharedPool: {
        type: 'string',
      },
      notifyUrl: {
        type: 'string',
      },
      incomingUrl: {
        type: 'string',
      },
      messages: {
        type: 'array',
        items: { $ref: '#sms/send' },
      },
    },
  },
  {
    $id: '#sms/getAll',
    type: 'object',
    additionalProperties: false,
    properties: {
      offset: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 1000 },
      status: { type: 'string'},
      startDate: { type: ['string', 'object'], dateTimeFormat: dateTimeFormat},
      endDate: { type: ['string', 'object'], dateTimeFormat: dateTimeFormat},
      destination: {
        type: ['string'],
        minLength: 3,
        maxLength: 15,
      },
      source: {
        type: ['string'],
        minLength: 3,
        maxLength: 15,
      },
      search: { type: 'string' },
    },
  },
  {
    $id: '#sms-incoming/getAll',
    type: 'object',
    additionalProperties: false,
    properties: {
      offset: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 1000 },
      status: { type: 'string' },
      startDate: { type: ['string', 'object'], dateTimeFormat: dateTimeFormat},
      endDate: { type: ['string', 'object'], dateTimeFormat: dateTimeFormat},
      destination: {
        type: ['string'],
        minLength: 3,
        maxLength: 15,
      },
      source: {
        type: ['string'],
        minLength: 3,
        maxLength: 15,
      },
      search: { type: 'string' },
    },
  },
  {
    $id: '#otp/verify-with-id',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'code'],
    properties: {
      id: { type: 'string'},
      code: { type: 'string',  minLength: 4, maxLength: 10 },
    },
    errorMessage: {
      properties: {
        id: 'should be string',
        code: 'should be string',
      },
    },
  },
  {
    $id: '#otp/verify-with-destination',
    type: 'object',
    additionalProperties: false,
    required: ['destination', 'code'],
    properties: {
      destination: { type: 'string', minLength: 3, maxLength: 15},
      code: { type: 'string',  minLength: 4, maxLength: 10 },
    },
    errorMessage: {
      properties: {
        id: 'should be a string',
        code: 'should be string',
      },
    },
  },
  {
    $id: '#otp/send',
    type: 'object',
    additionalProperties: false,
    required: ['destination', 'message'],
    properties: {
      origin: {
        type: ['null', 'string'],
        minLength: 3,
        maxLength: 15,
      },
      destination: {
        type: ['string'],
        minLength: 3,
        maxLength: 15,
      },
      message: { type: 'string' },
      messageExpiryDateTime: {
        type: ['string', 'object'],
        dateTimeFormat: dateTimeFormat,
      },
      length: {
        type: 'integer',
      },
      codeExpiry: {
        type: 'integer',
      },
    },
  },
];
