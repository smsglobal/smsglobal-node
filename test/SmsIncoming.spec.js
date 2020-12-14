const nock = require('nock');
const config = require('../lib/config');
const { assert, expect } = require('chai');
const errors = require('../lib/errors');

describe('Incoming', () => {
  const uri = '/sms-incoming';
  var Smsglobal;
  before(() => {
    Smsglobal = require('../lib')('key11', 'secret');
  });

  after(() => {
    delete process.env.SMSGLOBAL_API_KEY;
    delete process.env.SMSGLOBAL_API_SECRET;
  });

  afterEach(nock.cleanAll);

  describe('get', () => {

    let incomingSmsResponse = {
      id: 465605611,
      origin: '61400000001',
      destination: '61400000000',
      message: 'Test sms from SMSGlobal',
      dateTime: '2020-08-04 11:24:27 +1000',
      isMultipart: false,
    };

    it('should fail when a sms not found', () => {
      let id = 423423484234;
      nock(config.host).get(`${uri}/${id}`).reply(404);
      Smsglobal.sms.incoming.get(id, (err, res) => {
        assert.notEqual(err, '');
        assert.equal(err.statusCode, 404);
        expect(res).to.to.undefined;
      });
    });

    it('should fail when a sms not found with promise', () => {
      let id = 423423484234;
      nock(config.host).get(`${uri}/${id}`).reply(404);
      Smsglobal.sms.incoming.get(id).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.notEqual(err, '');
          assert.equal(err.statusCode, 404);
        },
      );
    });

    it('should fail when invalid id is given', () => {
      let id;
      nock(config.host).get(`${uri}/${id}`);
      Smsglobal.sms.incoming.get(id, (err, res) => {
        expect(err).to.not.be.empty;
        expect(res).to.to.undefined;
      });
    });

    it('should fetch sms as an object', () => {
      let id = incomingSmsResponse.id;
      nock(config.host).get(`${uri}/${id}`).reply(200, incomingSmsResponse);

      Smsglobal.sms.incoming.get(id, (err, res) => {
        assert.equal(err, '');
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.data, incomingSmsResponse);
      });
    });

    it('should fetch sms as an object with promise', () => {
      let id = incomingSmsResponse.id;
      nock(config.host).get(`${uri}/${id}`).reply(200, incomingSmsResponse);

      Smsglobal.sms.incoming.get(id).then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.data, incomingSmsResponse);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });
  });

  describe('getAll', () => {

    let getAllSmsResponse =  {
      total: 173,
      offset: 1,
      limit: 10,
      messages: [
        {
          origin: '61400000000',
          destination: '61400000001',
          dateTime: '2020-08-05 11:04:04 +1000',
          isMultipart: false,
        },
        {
          origin: '61400000000',
          destination: '61400000002',
          dateTime: '2020-08-04 15:56:05 +1000',
          isMultipart: false,
        }],
    };


    it('should fail when invalid search data is given with promise', () => {
      let query = { limit: 1200, destination: '33' };
      nock(config.host)
        .get(uri)
        .query(query)
        .reply(200, getAllSmsResponse);

      Smsglobal.sms.incoming.getAll(query).then(
        () =>  Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.equal(err, 'data.limit should be <= 1000, data.destination should NOT be shorter than 3 characters');
        },
      );
    });

    it('should fail when total of offset & limit is greater than 10,000', () => {
      // default limit is 20
      let query = { offset: 10000};
      nock(config.host)
        .get(uri)
        .query(query)
        .reply(200, getAllSmsResponse);

      Smsglobal.sms.incoming.getAll(query).then(
        () =>  Promise.reject(new Error('Expected method to reject.')),
        (err) => {
          assert.equal(err, errors.searchOffsetLimit);
        },
      );
    });

    it('should fail in the case of 404 with promise', () => {
      let query = { limit: 2};
      nock(config.host)
        .get(uri)
        .query(query)
        .reply(404);

      Smsglobal.sms.incoming.getAll(query).then(
        () =>  Promise.reject(new Error('Expected method to reject.')),
        (err) => { assert.equal(err.statusCode, 404);},
      );
    });


    it('should load outgoing sms list with as array when callback is only given argument', () => {
      nock(config.host)
        .get(uri)
        .reply(200, getAllSmsResponse);

      Smsglobal.sms.incoming.getAll((err, res) => {
        assert.equal(res.statusCode, 200);
        assert.deepEqual(
          res.data,
          getAllSmsResponse,
        );
      });
    });


    it('should load sms list with as array of object with promise', () => {
      let query = { limit: 2 };
      nock(config.host)
        .get(uri)
        .query(query)
        .reply(200, getAllSmsResponse);

      Smsglobal.sms.incoming.getAll(query).then(
        (res) => {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(
            res.data,
            getAllSmsResponse,
          );
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });
  });

  describe('delete', () => {
    it('should fail in the case of 404 with promise', () => {
      let id = 534234234234;

      nock(config.host).delete(`${uri}/${id}`).reply(404);

      Smsglobal.sms.incoming.delete(id).then(
        () => Promise.reject(new Error('Expected method to reject.')),
        (err) => { assert.equal(err.statusCode, 404);},
      );
    });

    it('should fail when invalid id is given', () => {
      let id;
      nock(config.host).delete(`${uri}/${id}`);
      Smsglobal.sms.incoming.delete(id, (err, res) => {
        expect(err).to.not.be.empty;
        expect(res).to.to.undefined;
      });
    });

    it('should delete a sms', () => {
      let id = 534234234234;
      nock(config.host).delete(`${uri}/${id}`).reply(204);

      Smsglobal.sms.incoming.delete(id, (err, res) => {
        assert.equal(err, '');
        assert.equal(res.statusCode, 204);
      });
    });

    it('should delete a sms with promise', () => {
      let id = 534234234234;
      nock(config.host).delete(`${uri}/${id}`).reply(204);
      Smsglobal.sms.incoming.delete(id).then(
        (res) => {
          assert.equal(res.statusCode, 204);
        },
        () => Promise.reject(new Error('Expected method to resolve.')),
      );
    });

  });
});
