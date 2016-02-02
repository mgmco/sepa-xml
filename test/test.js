'use strict';

var SepaXML = require('../index');
var expect = require('chai').expect;

describe('Module loads a new function', function() {
  it('Object `SepaXML` is a function', function() {
    expect(SepaXML).to.be.a('function');
  });
});

describe('Works with the `pain.001.001.03` format', function() {
  var sepaxml = new SepaXML('pain.001.001.03');
  sepaxml.setHeaderInfo({
    messageId: 'ABC123',
    initiator: 'SepaXML'
  });

  sepaxml.setPaymentInfo({
    id: 'XYZ987',
    method: 'TRF'
  });

  sepaxml.addTransaction({
    id: 'TRANSAC1',
    iban: 'NL21ABNA0531621583', // fake IBAN from https://www.generateiban.com/test-iban/ thanks
    name: 'generateiban',
    amount: 42
  });

  it('Loads the template for the format', function(done) {
    sepaxml.compile(function (err, out) {
      expect(err).to.be.null;
      expect(out).to.be.a('string');

      done();
    });
  });

});
