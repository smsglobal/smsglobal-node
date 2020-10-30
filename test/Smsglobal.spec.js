const { expect } = require('chai');
const errors = require('../lib/errors');

describe('Smsglobal', () => {

  after(() => {
    delete process.env.SMSGLOBAL_API_KEY;
    delete process.env.SMSGLOBAL_API_SECRET;
  });

  it('should fail if no api key or api secret are specified', () => {
    var Smsglobal = require('../lib');
    expect(() => { new Smsglobal();}).to.throw(errors.smsglobal);
  });

  it('should return smsglobal instahce with given key & secret', () => {
    const Smsglobal = require('../lib');
    expect((new Smsglobal('key', 'secret'))).to.be.an.instanceof(Smsglobal);
  });
});

