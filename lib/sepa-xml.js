'use strict';

var Handlebars = require('handlebars');
var fs = require('fs');
var BIC = require('../bics/list');

Handlebars.registerHelper('formatDate', function(dto) {
  return new Handlebars.SafeString(formatDate(dto));
});

Handlebars.registerHelper('timestamp', function() {
  var dto = new Date();
  return new Handlebars.SafeString(dto.toJSON().toString());
});

function bicLookup(iban) {
  return BIC[iban.slice(4, 8)];
}

function formatDate(dto) {
  dto = dto || new Date();

  var month = (dto.getMonth() + 1).toString();
  var day = dto.getDate().toString();

  return dto.getFullYear().toString() + '-' + (month[1] ? month : '0' + month) + '-' + (day[1] ? day : '0' + day);
}

function SepaXML(format) {
  this.outputFormat = format || 'pain.001.001.03';

  this._header = {
    messageId: null,
    initiator: null
  };

  this._payments = {
    info: {
      id: null,
      method: null,
      batchBooking: false
    },

    transactions: []
  };
}

SepaXML.prototype = {

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

  compile: function(cb) {
    var _self = this;

    this.verifyCurrentInfo(function (err) {
      if (err) return cb(err);

      fs.readFile(__dirname + '/../formats/' + _self.outputFormat + '.hbs', 'utf8', function (err, source) {
        if (err) return cb(err);

        var template = Handlebars.compile(source);
        cb(null, template(_self.templateData()));
      });
    });
  },

  templateData: function() {
    var controlSum = 0;
    var transactionCount = this._payments.transactions.length;

    for (var i = 0; i < this._payments.transactions.length; i++) {
      controlSum += parseFloat(this._payments.transactions[i].amount);
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
    if (!payment || !payment.iban || !payment.name || !payment.amount || !payment.id) return false;
    if (!payment.bic) payment.bic = bicLookup(payment.iban);

    this._payments.transactions.push({
      endToEndId: payment.id,
      amount: payment.amount,
      bic: payment.bic,
      recipientName: payment.name,
      recipientIBAN: payment.iban
    });
  },

  verifyCurrentInfo: function(cb) {
    var errors = [];

    for (var p in this._header) {
      if (this._header[p] === null) errors.push('You have not filled in the `' + p + '`.');
    }

    for (var p in this._payments.info) {
      if (this._payments.info[p] === null) errors.push('You have not filled in the `' + p + '`.');
    }

    if (this._payments.transactions.length === 0) errors.push('The list of transactions is empty.');

    cb((errors.length === 0) ? null : errors);
  }

};

module.exports = SepaXML;
