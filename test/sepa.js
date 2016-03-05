'use strict';

var SepaXML = require('../index');
var expect = require('chai').expect;

describe('Sepa', function () {
  it('Object `setOptions` is a function', function() {
    expect(SepaXML.setOptions).to.be.a('function');
  });

  it('Object `createCredit` is a function', function() {
    expect(SepaXML.createCredit).to.be.a('function');
  });

  describe('Can set options', function () {
    it('should have default values', function () {
      expect(SepaXML.options).to.be.eql({
        creditVersion: 'pain.001.001.03'
      });
    });

    it('should update values', function () {
      SepaXML.setOptions({
        creditVersion: 'pain.001.001.02'
      });

      expect(SepaXML.options).to.be.eql({
        creditVersion: 'pain.001.001.02'
      });
    });
  });
});
