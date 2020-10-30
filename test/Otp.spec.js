const nock = require('nock');
const config = require('../lib/config');
const { assert, expect } = require('chai');
const errors = require('../lib/errors');

describe('OTP', () => {
  const uri = '/otp';
  var Smsglobal;
  before(() => {
    Smsglobal = require('../lib')('key11', 'secret');
  });

  after(() => {
    delete process.env.SMSGLOBAL_API_KEY;
    delete process.env.SMSGLOBAL_API_SECRET;
  });

  afterEach(nock.cleanAll);

  describe('Send', () => {

    it('should fail when invalid data ', () => {
      nock(config.host)
        .post(uri)
        .reply(400);
      Smsglobal.otp.send(undefined, function (err, res) {
        assert.notEqual(err, '');
        expect(res).to.to.undefined;
      });
    });

    it('should fail when invalid data is given with promise', () => {
      nock(config.host)
        .post(uri);

      Smsglobal.otp.send({
        origin: 'sm',
      })
        .then(() => Promise.reject(new Error('Expected method to reject.')))
        .catch((err) =>
          assert.equal(
            err,
            'data.origin should NOT be shorter than 3 characters, data should have required property \'destination\', data should have required property \'message\'',
          ),
        );
    });

    it('should fail when 400 returned from server', () => {
      let response = {
        errors: {
          message: {
            errors: [
              'Message template should contain a placeholder for code i.e. {*code*}.',
            ],
          },
          destination: {
            errors: [
              'Destination number \'xxxxxxxxxxx\' is invalid.',
            ],
          },
        },
      };

      nock(config.host)
        .post(uri)
        .reply(400, response);

      Smsglobal.otp.send({destination: 'xxxxxxxxxxx', message: '*code* is your SMSGlobal verification code.'}, function (err, res) {
        assert.notEqual(err, '');
        assert.equal(err.statusCode, 400);
        assert.deepEqual(err.data, response);
        expect(res).to.to.undefined;
      });
    });

    it('should send an OTP message to the provided destination with promise', () => {
      let response = {
        requestId: '404372541681858603038893',
        validUnitlTimestamp: '2020-10-29 15:24:33',
        createdTimestamp: '2020-10-29 15:22:33',
        lastEventTimestamp: '2020-10-29 15:22:33',
        status: 'Sent',
      };
      nock(config.host)
        .post(uri)
        .reply(200, response);

      Smsglobal.otp.send({destination: '0488265265', message: '{*code*} is your SMSGlobal verification code.'}).then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, response);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });
  });

  describe('cancel', () => {

    it('should fail when id is not string', () => {
      let id = null;
      nock(config.host).put(`${uri}/${id}/cancel`).reply(404);
      Smsglobal.otp.cancel(id, (err, res) => {
        assert.notEqual(err, '');
        assert.equal(err, errors.otp.id);
        expect(res).to.be.undefined;
      });
    });

    it('should fail when id is not string with promise', () => {
      let id = 532523423;
      nock(config.host).put(`${uri}/${id}/cancel`).reply(404);
      Smsglobal.otp.cancel(id).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err, res) => {
          assert.notEqual(err, '');
          assert.equal(err, errors.otp.id);
          expect(res).to.be.undefined;
        },
      );
    });

    it('should fail when an OTP request not found with promise', () => {
      let id = '5325234233245234';
      nock(config.host).put(`${uri}/${id}/cancel`).reply(404);
      Smsglobal.otp.cancel(id).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.notEqual(err, '');
          assert.equal(err.statusCode, 404);
        },
      );
    });

    it('should fail if an OTP request is already cancelled, expired or verified with promise', () => {
      let id = '5325234233245234';
      let response = { error: 'The input code has already been cancelled.'};

      nock(config.host).put(`${uri}/${id}/cancel`).reply(409, response);

      Smsglobal.otp.cancel(id).then(
        () => Promise.reject(new Error('Expected method to reject.')),
      ).catch((err) => {
        assert.notEqual(err, '');
        assert.equal(err.statusCode, 409);
        assert.deepEqual(err.data, response);
      });
    });

    it('should cancel an OTP request with with promise', () => {
      let id = '5325234233245234';
      nock(config.host).put(`${uri}/${id}/cancel`).reply(204);
      Smsglobal.otp.cancel(id).then(
        (res) => {
          assert.equal(res.statusCode, 204);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });
  });

  describe('verify', () => {

    it('should fail when id and code is not string', () => {
      let id = null;
      nock(config.host).post(`${uri}/${id}`).reply(404);
      Smsglobal.otp.verify(id, 43545, (err, res) => {
        assert.notEqual(err, '');
        assert.equal(err, 'data.id should be string, data.code should be string');
        expect(res).to.be.undefined;
      });
    });

    it('should fail when an OTP code is missimg with with promise', () => {
      let id = '5325234233245234';
      nock(config.host).post(`${uri}/${id}`).reply(404);
      Smsglobal.otp.verify(id).then(
        () => Promise.reject(new Error('Expected method to reject.')),
      ).catch((err) => {
        assert.notEqual(err, '');
        assert.equal(err, errors.otp.code);
      });
    });

    it('should fail when an OTP code doesn\'t matched', () => {
      let id = '5325234233245234';
      let response = { error: 'The input code does not match with the code sent to the user.'};

      nock(config.host).post(`${uri}/${id}`).reply(400,
        response);
      Smsglobal.otp.verify(id, '32423').then(
        () => Promise.reject(new Error('Expected method to reject.')),
      ).catch((err) => {
        assert.equal(err.statusCode, 400);
        assert.deepEqual(err.data, response);
      });
    });

    it('should fail when an OTP code has been expired', () => {
      let id = '5325234233245234';
      let response = { error: 'The input code has been expired.'};

      nock(config.host).post(`${uri}/${id}`).reply(400,
        response);
      Smsglobal.otp.verify(id, '32423').then(
        () => Promise.reject(new Error('Expected method to reject.')),
      ).catch((err) => {
        assert.equal(err.statusCode, 400);
        assert.deepEqual(err.data, response);
      });
    });

    it('should fail if an OTP request is already cancelled, expired or verified with promise', () => {
      let id = '5325234233245234';
      let response = { error: 'The input code has already been cancelled.'};

      nock(config.host).post(`${uri}/${id}`).reply(409, response);
      Smsglobal.otp.verify(id, '32423').then(
        () => Promise.reject(new Error('Expected method to reject.')),
      ).catch((err) => {
        assert.notEqual(err, '');
        assert.equal(err.statusCode, 409);
        assert.deepEqual(err.data, response);
      });
    });


    it('should should verify an OTP request', () => {
      let id = '5325234233245234';
      nock(config.host).post(`${uri}/${id}`).reply(204);
      Smsglobal.otp.verify(id, '32423').then(
        (res) => {
          assert.equal(res.statusCode, 204);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });

  });

  describe('get', () => {

    it('should fail when id is not string', () => {
      let id = null;
      nock(config.host).get(`${uri}/${id}`).reply(404);
      Smsglobal.otp.get(id, (err, res) => {
        assert.notEqual(err, '');
        assert.equal(err, errors.otp.id);
        expect(res).to.be.undefined;
      });
    });

    it('should fail when id is not string with promise', () => {
      let id = 532523423;
      nock(config.host).get(`${uri}/${id}`).reply(404);
      Smsglobal.otp.get(id).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err, res) => {
          assert.notEqual(err, '');
          assert.equal(err, errors.otp.id);
          expect(res).to.be.undefined;
        },
      );
    });

    it('should fail when an OTP request not found with promise', () => {
      let id = '5325234233245234';
      nock(config.host).get(`${uri}/${id}`).reply(404);
      Smsglobal.otp.get(id).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.notEqual(err, '');
          assert.equal(err.statusCode, 404);
        },
      );
    });

    it('should fetch an OTP request as an object', () => {
      let OTPResponse = {
        requestId: '404372541681206744638349',
        validUnitlTimestamp: '2020-10-22 10:51:32',
        createdTimestamp: '2020-10-22 10:41:32',
        lastEventTimestamp: '2020-10-22 10:41:33',
        status: 'Sent',
      };
      nock(config.host)
        .get(`${uri}/${OTPResponse.requestId}`)
        .reply(200, OTPResponse);

      Smsglobal.otp.get(OTPResponse.requestId).then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, OTPResponse);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });
  });

  describe('getAll', () => {

    let response = {
      total: 2,
      offset: 1,
      limit: 20,
      OTPS: [
        {
          requestId: '404372541681858603038893',
          validUnitlTimestamp: '2020-10-29 15:24:33',
          createdTimestamp: '2020-10-29 15:22:33',
          lastEventTimestamp: '2020-10-29 15:33:28',
          status: 'Verified',
        },
        {
          requestId: '404372541681752148467848',
          validUnitlTimestamp: '2020-10-28 11:12:30',
          createdTimestamp: '2020-10-28 11:10:30',
          lastEventTimestamp: '2020-10-28 11:10:55',
          status: 'Verified',
        },
      ],
    };

    it('should fail when invalid search data is given with promise', () => {
      let query = { limit: 1200, status: 34234, startDate: '3524' };
      nock(config.host)
        .get(uri)
        .query(query)
        .reply(200, response);

      Smsglobal.otp.getAll(query).then(
        () =>  Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.equal(err, 'data.limit should be <= 1000, data.status should be string, data.startDate shoud be a valid date time string (yyyy-MM-dd HH:mm:ss)');
        },
      );
    });


    it('should fail when total of offset & limit is greater than 10,000', () => {
      // default limit is 20
      let query = { offset: 10000};
      nock(config.host)
        .get(uri)
        .query(query)
        .reply(200, response);

      Smsglobal.otp.getAll(query).then(
        () =>  Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.equal(err, errors.searchOffsetLimit);
        },
      );
    });

    it('should fail in the case of 404 with promise', () => {
      // default limit is 20
      let query = { offset: 20};
      nock(config.host)
        .get(uri)
        .query(query)
        .reply(404);

      Smsglobal.otp.getAll(query).then(
        () =>  Promise.reject(new Error('Expected method to reject.')),
        (err) => { assert.equal(err.statusCode, 404);},
      );
    });

    it('should load otp lsit with filter options', () => {

      let query = { status: 'Verified'};
      nock(config.host)
        .get(uri)
        .query(query)
        .reply(200, response);

      Smsglobal.otp.getAll(query, (err, res) => {
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.data, response);
      });

    });

    it('should load otp list with as array when callback is only given argument', () => {
      nock(config.host)
        .get(uri)
        .reply(200, response);

      Smsglobal.otp.getAll((err, res) => {
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.data, response);
      });

    });

    it('should load all OTP list with as an array of object with promise', () => {

      nock(config.host)
        .get(uri)
        .reply(200, response);
      Smsglobal.otp.getAll().then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, response);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });

  });
});
