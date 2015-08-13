'use strict';

var Handlebars = require('handlebars');
var fs = require('fs');
var BIC = require('../bics/list');

function SepaXML(format) {
  this.outputFormat = format || 'pain.001.001.03';
}

SepaXML.prototype = {

  _header: {},
  _payments: {
    info: {},
    transactions: []
  },

  setHeaderInfo: function(params) {
    for (var p in params) {
      this._header[p] = params[p];
    }
  },

  setPaymentInfo: function(params) {
    for (var p in params) {
      this._payments.info[p] = params[p];
    }
  },

  compile: function() {
    if (!this.verifyCurrentInfo()) return false;

    var source = fs.readFileSync('../formats/' + this.outputFormat + '.hbs', 'utf8');
    var template = Handlebars.compile(source);
    var compiled = template(this.templateData());
    return compiled;
  },

  templateData: function() {
    return {
      _header: this._header,
      _payments: this._payments
    };
  },

  addTransaction: function(payment) {
    if (!payment.iban || !payment.name || !payment.amount) return false;
    if (!payment.bic) payment.bic = this.bicLookup(payment.iban);

    this._payments.transactions.push(payment);
  },

  bicLookup: function(bankCode) {

  },

  verifyCurrentInfo: function() {
    return true;
  }

};

module.exports = SepaXML;
