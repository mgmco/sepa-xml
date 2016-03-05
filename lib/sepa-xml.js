'use strict';

var credit = require('./credit.js');

var sepa = {

  options: {
    creditVersion: 'pain.001.001.03'
  },

  setOptions: function (options) {
    sepa.options.creditVersion = options.creditVersion;
  },

  createCredit: function (version){
    return new credit(version || sepa.options.creditVersion);
  }

};

module.exports = sepa;
