'use strict';

var Handlebars = require('handlebars');
var fs = require('fs');
var BIC = require('../bics/list');

function SepaXML(format) {
  this.outputFormat = format || 'pain.001.001.03';
}

SepaXML.prototype = {

  _header: {
    messageId: null,
    initiator: null
  },

  _payments: {
    info: {
      id: null,
      method: null,
      batchBooking: false
    },

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
    var _self = this;

    Handlebars.registerHelper('formatDate', function(dto) {
      return new Handlebars.SafeString(_self.formatDate(dto));
    });

    Handlebars.registerHelper('timestamp', function() {
      var dto = new Date();
      return new Handlebars.SafeString(dto.toJSON().toString());
    });

    var source = fs.readFileSync(__dirname + '/../formats/' + this.outputFormat + '.hbs', 'utf8');
    var template = Handlebars.compile(source);
    var compiled = template(this.templateData());
    return compiled;
  },

  templateData: function() {
    var controlSum = 0;
    var transactionCount = this._payments.transactions.length;

    for (var i = 0; i < this._payments.transactions.length; i++) {
      controlSum += parseInt(this._payments.transactions[i].amount);
    }

    this._header.transactionCount = transactionCount;
    this._header.transactionControlSum = controlSum;

    this._payments.transactionCount = transactionCount;
    this._payments.transactionControlSum = controlSum;

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

  bicLookup: function(iban) {
    return BIC[iban.slice(4, 8)];
  },

  verifyCurrentInfo: function() {
    var errors = [];

    for (var p in this._header) {
      if (this._header[p] === null) errors.push('You have not filled in the `' + p + '`.');
    }

    for (var p in this._payments.info) {
      if (this._payments.info[p] === null) errors.push('You have not filled in the `' + p + '`.');
    }

    if (this._payments.transactions.length < 1) errors.push('The list of transactions is empty.');

    if (errors.length === 0) {
      return true;
    } else {
      console.error(errors.join('\n'));
      return false;
    }
  },

  formatDate: function(dto) {
    dto = dto || new Date();

    var month = (dto.getMonth() + 1).toString();
    var day = dto.getDate().toString();

    return dto.getFullYear().toString() + '-' + (month[1] ? month : '0' + month) + '-' + (day[1] ? day : '0' + day);
  }

};

module.exports = SepaXML;
