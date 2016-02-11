'use strict';

var BIC = require('../bics/list');

var payment = require('./payment');

function bicLookup(iban) {
  return BIC[iban.slice(4, 8)];
}

function Payment(info) {
  this._info =  {
    id: info.id,
    method: info.method,
    batchBooking: false
  };

  this._transactions = [];
}

Payment.prototype = {

  setInfo: function (params) {
    for (var p in params) {
      this._info[p] = params[p];
    }
  },

  addTransaction: function (payment) {
    if (!payment || !payment.iban || !payment.name || !payment.amount || !payment.id) return false;
    if (!payment.bic) payment.bic = bicLookup(payment.iban);

    this._transactions.push({
      endToEndId: payment.id,
      amount: payment.amount,
      bic: payment.bic,
      recipientName: payment.name,
      recipientIBAN: payment.iban
    });
  }

};

module.exports = Payment;
