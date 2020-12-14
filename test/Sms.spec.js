const nock = require('nock');
const config = require('../lib/config');
const { assert, expect } = require('chai');
const errors = require('../lib/errors');

describe('Outgoing', () => {
  const uri = '/sms';
  var Smsglobal;
  before(() => {
    Smsglobal = require('../lib')('key11', 'secret');
  });

  after(() => {
    delete process.env.SMSGLOBAL_API_KEY;
    delete process.env.SMSGLOBAL_API_SECRET;
  });

  afterEach(nock.cleanAll);

  const apiOutgingResponses = {
    singleDestination: {
      id: 6359736682344313,
      outgoing_id: 5211897953,
      origin: 'NodeSdk',
      destination: '61400000000',
      message: 'Test sms from node sdk',
      status: 'sent',
      dateTime: '2020-07-30 13:23:38 +0000',
    },
    multipleDestinations: {
      messages: [
        {
          outgoing_id: 5211920573,
          origin: 'NodeSdk',
          destination: '61400000000',
          message: 'Test sms from node sdk',
          dateTime: '2020-07-30 14:29:50 +0000',
          status: 'Processing',
        },
        {
          outgoing_id: 5211920583,
          origin: 'NodeSdk',
          destination: '61400000000',
          message: 'Test sms from node sdk',
          dateTime: '2020-07-30 14:29:50 +0000',
          status: 'Processing',
        },
      ],
    },
    incompleteMesssage: {
      status: 'OK',
      data: { messages: [] },
    },
    fetchSingleSms: {
      id: 6088544242604429,
      outgoing_id: 5252344293,
      origin: 'NodeSdk',
      destination: '61400000000',
      message: 'Test sms from node sdk',
      status: 'delivered',
      dateTime: '2020-08-18 10:36:29 +1000',
    },
    fetchAllSms: {
      total: 4165,
      offset: 1,
      limit: 2,
      messages: [
        {
          id: 6088544242604429,
          outgoing_id: 5252344293,
          origin: 'NodeSdk',
          destination: '61400000000',
          message: 'Test sms from node sdk',
          status: 'delivered',
          dateTime: '2020-08-18 10:36:29 +1000',
        },
        {
          id: 6298870819574735,
          outgoing_id: 5252344303,
          origin: 'NodeSdk2',
          destination: '61400000000',
          message: 'Test sms from node sdk',
          status: 'delivered',
          dateTime: '2020-08-18 10:36:29 +1000',
        },
      ],
    },
  };

  describe('send', () => {
    it('should fail when no data is given', () => {
      nock(config.host)
        .post(uri)
        .reply(400, {
          status: 'Bad Request',
          data: {
            errors: { origin: { errors: ['Origin is invalid.'] } },
          },
        });

      Smsglobal.sms.send(undefined, function (err, res) {
        assert.notEqual(err, '');
        expect(res).to.to.undefined;
      });
    });

    it('should fail when invalid data is given with promise', () => {
      nock(config.host)
        .post(uri)
        .reply(404, {
          status: 'Bad Request',
          data: {
            errors: { origin: { errors: ['Origin is invalid.'] } },
          },
        });

      Smsglobal.sms
        .send({
          origin: 'sm',
          message: {},
        })
        .then(() => Promise.reject(new Error('Expected method to reject.')))
        .catch((err) =>
          assert.equal(
            err,
            'data.origin should NOT be shorter than 3 characters, data.message should be string',
          ),
        );
    });

    it('should fail when 400 returned from server.', () => {
      nock(config.host)
        .post(uri)
        .reply(400, {
          status: 'Bad Request',
          data: {
            errors: { origin: { errors: ['Origin is invalid.'] } },
          },
        });

      Smsglobal.sms.send({messages: [{}]}, function (err, res) {
        assert.notEqual(err, '');
        assert.equal(err.statusCode, 400);
        expect(res).to.to.undefined;
      });
    });

    it('should return an empty array when an empty array of messages is given with promise', () => {
      nock(config.host)
        .post(uri)
        .reply(200, {
          status: 'OK',
          data: {
            messages: [],
          },
        });

      Smsglobal.sms.send({ messages: [{}]}).then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, apiOutgingResponses.incompleteMesssage);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });

    it('should send a sms to single destination with promises', () => {
      nock(config.host)
        .post(uri)
        .reply(200, apiOutgingResponses.singleDestination);

      Smsglobal.sms
        .send({
          origin: 'NodeSdk',
          message: 'Test sms from node sdk 2',
          destination: '61400000000',
          scheduledDateTime: '2020-08-28 03:38:20',
        })
        .then((res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, apiOutgingResponses.singleDestination);
        }, () =>
          Promise.reject(new Error('Expected method to resolve.')),
        );
    });

    it('should send a sms to multiple destinations', () => {
      nock(config.host)
        .post(uri)
        .reply(200, apiOutgingResponses.multipleDestinations);

      Smsglobal.sms.send(
        {
          origin: 'NodeSdk',
          destinations: ['61400000000', '61400000001'],
          message: 'Test sms from node sdk 2',
        },
        function (err, res) {
          assert.equal(err, '');
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, apiOutgingResponses.multipleDestinations);
        },
      );
    });

    it('should send mulitple sms as an array', () => {
      nock(config.host)
        .post(uri)
        .reply(200, apiOutgingResponses.multipleDestinations);

      Smsglobal.sms.send(
        {
          messages: [
            {
              origin: 'NodeSdk',
              destination: '61400000000',
              message: 'Test sms from node sdk 1',
            },
            {
              origin: 'NodeSdk',
              destination: '61400000000',
              message: 'Test sms from node sdk 2',
            },
          ],
        },
        function (err, res) {
          assert.equal(err, '');
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, apiOutgingResponses.multipleDestinations);
        },
      );
    });
  });

  describe('get', () => {
    it('should fail when a sms not found', () => {
      let id = 423423484234;
      nock(config.host).get(`${uri}/${id}`).reply(404);
      Smsglobal.sms.get(id, (err, res) => {
        assert.notEqual(err, '');
        assert.equal(err.statusCode, 404);
        expect(res).to.to.undefined;
      });
    });

    it('should fail when a sms not found with promise', () => {
      let id = 423423484234;
      nock(config.host).get(`${uri}/${id}`).reply(404);
      Smsglobal.sms.get(id).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.notEqual(err, '');
          assert.equal(err.statusCode, 404);
        },
      );
    });


    it('should fail when id not given with promise', () => {
      let id = apiOutgingResponses.fetchSingleSms.id;
      nock(config.host)
        .get(`${uri}/${id}`)
        .reply(200, apiOutgingResponses.fetchSingleSms);

      Smsglobal.sms.get().then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.notEqual(err, '');
          assert.equal(err, 'data should be integer,string');
        },
      );
    });

    it('should fetch single sms as an object', () => {
      let id = apiOutgingResponses.fetchSingleSms.id;
      nock(config.host)
        .get(`${uri}/${id}`)
        .reply(200, apiOutgingResponses.fetchSingleSms);

      Smsglobal.sms.get(id).then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, apiOutgingResponses.fetchSingleSms);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });
  });


  describe('getAll', () => {

    it('should load outgoing sms list with as array when callback is only given argument', () => {
      nock(config.host)
        .get('/sms')
        .reply(200, apiOutgingResponses.fetchAllSms);

      Smsglobal.sms.getAll((err, res) => {
        assert.equal(err, '');
        assert.equal(res.statusCode, 200);
        assert.deepEqual(
          res.data,
          apiOutgingResponses.fetchAllSms,
        );
      });
    });

    it('should fail when invalid search data is given with promise', () => {
      let query = { limit: 2, destination: 'da' };
      nock(config.host)
        .get('/sms')
        .query(query)
        .reply(200, apiOutgingResponses.fetchAllSms);

      Smsglobal.sms.getAll(query).then(
        () => Promise.reject(new Error('Expected method to reject.')),

        (err) => {
          assert.equal(err, 'data.destination should NOT be shorter than 3 characters');
        },
      );
    });

    it('should fail when total of offset & limit is greater than 10,000', () => {
      let query = { limit: 1000, offset: 9001};
      nock(config.host)
        .get('/sms')
        .query(query)
        .reply(200, apiOutgingResponses.fetchAllSms);

      Smsglobal.sms.getAll(query).then(
        () =>  Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.equal(err, errors.searchOffsetLimit);
        },
      );
    });

    it('should fail when total of offset & limit is greater than 10,000', () => {
      // default limit is 20
      let query = { offset: 10000};
      nock(config.host)
        .get('/sms')
        .query(query)
        .reply(200, apiOutgingResponses.fetchAllSms);

      Smsglobal.sms.getAll(query).then(
        () =>  Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.equal(err, errors.searchOffsetLimit);
        },
      );
    });

    it('should fail in the case of 404 with promise', () => {
      let query = { limit: 2};
      nock(config.host)
        .get('/sms')
        .query(query)
        .reply(404);

      Smsglobal.sms.getAll(query).then(
        () =>  Promise.reject(new Error('Expected method to reject.')),
        (err) => { assert.equal(err.statusCode, 404);},
      );
    });


    it('should load outgoing sms list with as array of object with promise', () => {
      let query = { limit: 2 };
      nock(config.host)
        .get('/sms')
        .query(query)
        .reply(200, apiOutgingResponses.fetchAllSms);

      Smsglobal.sms.getAll(query).then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(
            res.data,
            apiOutgingResponses.fetchAllSms,
          );
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });


  });

  describe('delete', () => {
    it('should fail when invalid id is given', () => {
      let id;
      nock(config.host).delete(`${uri}/${id}`).reply(204);
      Smsglobal.sms.delete(id, (err, res) => {
        expect(err).to.not.be.empty;
        expect(res).to.to.undefined;
      });
    });

    it('should delete a sms with promise', () => {
      let id = 534234234234;
      nock(config.host).delete(`${uri}/${id}`).reply(204);

      Smsglobal.sms.delete(id).then(
        (res) => {
          assert.equal(res.statusCode, 204);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });

    it('should fail in the case of 404 with promise', () => {
      let id = 534234234234;
      nock(config.host).delete(`${uri}/${id}`).reply(404);
      Smsglobal.sms.delete(id).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err) => { assert.equal(err.statusCode, 404);},
      );
    });
  });
});

