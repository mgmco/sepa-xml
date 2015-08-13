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

  it('Loads the template for the format', function() {
    expect(sepaxml.compile()).to.be.a('string');
  });

});
