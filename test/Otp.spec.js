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
        destination: '61400000000',
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

    let response = {
      requestId: '404372541681858603038893',
      destination: '61400000000',
      validUnitlTimestamp: '2020-10-29 15:24:33',
      createdTimestamp: '2020-10-29 15:22:33',
      lastEventTimestamp: '2020-10-29 15:22:33',
      status: 'Cancelled',
    };

    it('should fail when id is not string', () => {
      let id = null;
      nock(config.host).post(`${uri}/requestid/${id}/cancel`).reply(404);
      Smsglobal.otp.cancelByRequestId(id, (err, res) => {
        assert.notEqual(err, '');
        assert.equal(err, errors.otp.id);
        expect(res).to.be.undefined;
      });
    });

    it('should fail when id is not string with promise', () => {
      let destination = 6140000000;
      nock(config.host).post(`${uri}/${destination}/cancel`).reply(404);
      Smsglobal.otp.cancelByDestination(destination).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err, res) => {
          assert.notEqual(err, '');
          assert.equal(err, errors.otp.destination);
          expect(res).to.be.undefined;
        },
      );
    });

    it('should fail when an OTP not found with destination number & promise', () => {
      nock(config.host).post(`${uri}/requestid/${response.requestId}/cancel`).reply(404);
      Smsglobal.otp.cancelByRequestId(response.requestId).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.notEqual(err, '');
          assert.equal(err.statusCode, 404);
        },
      );
    });

    it('should fail when an OTP not found with destination number & promise', () => {
      let destination = '61400000000';
      nock(config.host).post(`${uri}/${destination}/cancel`).reply(404);
      Smsglobal.otp.cancelByDestination(destination).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.notEqual(err, '');
          assert.equal(err.statusCode, 404);
        },
      );
    });

    it('should cancel an OTP with request ID', () => {
      nock(config.host).post(`${uri}/requestid/${response.requestId}/cancel`).reply(200, response);
      Smsglobal.otp.cancelByRequestId(response.requestId, (err, res) => {
        assert.equal(err, '');
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.data, response);
      });
    });

    it('should cancel an OTP with request ID and promise', () => {
      nock(config.host).post(`${uri}/requestid/${response.requestId}/cancel`).reply(200, response);
      Smsglobal.otp.cancelByRequestId(response.requestId).then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, response);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });

    it('should cancel an OTP with destination number', () => {
      nock(config.host).post(`${uri}/${response.destination}/cancel`).reply(200, response);
      Smsglobal.otp.cancelByDestination(response.destination, (err, res) => {
        assert.equal(err, '');
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.data, response);
      });
    });

    it('should cancel an OTP with destination number and promise', () => {
      nock(config.host).post(`${uri}/${response.destination}/cancel`).reply(200, response);
      Smsglobal.otp.cancelByDestination(response.destination).then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, response);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });
  });

  describe('verify', () => {

    let response = {
      requestId: '404372541681858603038893',
      destination: '61400000000',
      validUnitlTimestamp: '2020-10-29 15:24:33',
      createdTimestamp: '2020-10-29 15:22:33',
      lastEventTimestamp: '2020-10-29 15:22:33',
      status: 'Verified',
    };

    it('should fail when id and code is not string', () => {
      let id = null;
      nock(config.host).post(`${uri}/requestid/${id}/validate`).reply(404);
      Smsglobal.otp.verifyByRequestId(id, 43545, (err, res) => {
        assert.notEqual(err, '');
        assert.equal(err, 'data.id should be string, data.code should be string');
        expect(res).to.be.undefined;
      });
    });

    it('should fail when an OTP code is missimg with with promise', () => {
      nock(config.host).post(`${uri}/${response.destination}/validate`).reply(404);
      Smsglobal.otp.verifyByDestination(response.destination, 3243).then(
        () => Promise.reject(new Error('Expected method to reject.')),
      ).catch((err) => {
        assert.notEqual(err, '');
        assert.equal(err, 'data.code should be string');
      });
    });

    it('should fail when an OTP code doesn\'t matched with request Id', () => {
      let errorResponse = { error: 'The input code does not match with the code sent to the user.'};

      nock(config.host).post(`${uri}/requestid/${response.requestId}/validate`).reply(400, errorResponse);
      Smsglobal.otp.verifyByRequestId(response.requestId, '32423').then(
        () => Promise.reject(new Error('Expected method to reject.')),
      ).catch((err) => {
        assert.equal(err.statusCode, 400);
        assert.deepEqual(err.data, errorResponse);
      });
    });

    it('should fail when an OTP code doesn\'t matched with destination number', () => {
      let errorResponse = { error: 'The input code does not match with the code sent to the user.'};

      nock(config.host).post(`${uri}/${response.destination}/validate`).reply(400, errorResponse);
      Smsglobal.otp.verifyByDestination(response.destination, '32423').then(
        () => Promise.reject(new Error('Expected method to reject.')),
      ).catch((err) => {
        assert.equal(err.statusCode, 400);
        assert.deepEqual(err.data, errorResponse);
      });
    });

    it('should should verify an OTP request with request id', () => {
      nock(config.host).post(`${uri}/requestid/${response.requestId}/validate`).reply(200, response);
      Smsglobal.otp.verifyByRequestId(response.requestId, '32423', (err, res) => {
        assert.equal(err, '');
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.data, response);
      });
    });

    it('should should verify an OTP request with request id and promise', () => {
      nock(config.host).post(`${uri}/requestid/${response.requestId}/validate`).reply(200, response);
      Smsglobal.otp.verifyByRequestId(response.requestId, '32423').then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, response);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });


    it('should should verify an OTP request with destination number', () => {
      nock(config.host).post(`${uri}/${response.destination}/validate`).reply(200, response);
      Smsglobal.otp.verifyByDestination(response.destination, '32423', (err, res) => {
        assert.equal(err, '');
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.data, response);
      });
    });

    it('should should verify an OTP request with destination number and promise', () => {
      nock(config.host).post(`${uri}/${response.destination}/validate`).reply(200, response);
      Smsglobal.otp.verifyByDestination(response.destination, '32423').then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, response);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });

  });
});
