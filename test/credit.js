'use strict';

var SepaXML = require('../index');
var expect = require('chai').expect;

describe('Credit', function () {
  describe('Options for createCredit', function () {
    var defaultsepaxml = SepaXML.createCredit();

    it('should be `pain.001.001.03` version per default', function () {
      expect(defaultsepaxml.options).to.be.eql({
        version: 'pain.001.001.03'
      });
    });

    it('should change version', function () {
      defaultsepaxml.setOptions('pain.001.001.02');
      expect(defaultsepaxml.options).to.be.eql({
        version: 'pain.001.001.02'
      });
    });
  });

  ['pain.001.001.02', 'pain.001.001.03'].forEach(function (version) {
    describe('Works with the `' + version + '` format', function() {
      SepaXML.setOptions({
        creditVersion: version
      });

      var credit = new SepaXML.createCredit();

      credit.setHeaderInfo({
        messageId: 'ABC123',
        initiator: 'SepaXML'
      });

      var payment = new credit.createPayment({
        id: 'XYZ987',
        method: 'TRF'
      });

      payment.addTransaction({
        id: 'TRANSAC1',
        iban: 'NL21ABNA0531621583', // fake IBAN from https://www.generateiban.com/test-iban/ thanks
        name: 'generateiban',
        amount: 42
      });

      credit.addPayment(payment);

      it('should add payment', function () {
        expect(credit._payments.length).to.be.eql(1);
      });

      it('Loads the template for the format', function(done) {
        credit.compile(function (err, out) {
          expect(err).to.be.null;
          expect(out).to.be.a('string');

          done();
        });
      });

      it('should autofill BIC', function () {
        expect(credit._payments[0]._transactions[0].bic).to.be.eql('ABNANL2A');
      });

      it('should made transaction Control Sum', function () {
        expect(credit._header.transactionCount).to.be.equal(1);
        expect(credit._header.transactionControlSum).to.be.equal(42);

        expect(credit._payments[0].transactionCount).to.be.equal(1);
        expect(credit._payments[0].transactionControlSum).to.be.equal(42);
      });
    });
  });

  describe('Payment', function () {
    var credit = new SepaXML.createCredit();

    credit.setHeaderInfo({
      messageId: 'ABC123',
      initiator: 'SepaXML'
    });

    it('should create Payment', function () {
      var payment = new credit.createPayment({
        id: 'XYZ987',
        method: 'TRF'
      });

      expect(payment._info).to.be.eql({
        id: 'XYZ987',
        method: 'TRF',
        batchBooking: false
      });

      expect(payment._transactions).to.be.eql([]);
    });

    it('should update Payment infos', function () {
      var payment = new credit.createPayment({
        id: 'XYZ987',
        method: 'TRF'
      });

      payment.setInfo({
        id: 'ABC123'
      });

      expect(payment._info.id).to.be.equal('ABC123');
    });
  });

  describe('Validations', function () {
    it('should return validation', function(done) {
      var emptySepa = new SepaXML.createCredit('pain.001.001.02');

      emptySepa.compile(function (err, out) {
        expect(out).to.be.undefined;
        expect(err).to.be.eql([
          'You have not filled in the `messageId`.',
          'You have not filled in the `initiator`.',
          'The list of payments is empty.'
        ]);

        done();
      });
    });

    // it('should validate new transaction', function () {
    //   expect(sepaxml.addTransaction()).to.be.false;
    //   expect(sepaxml._payments.transactions.length).to.be.equal(1);
    // });

    it('should use a bad format', function (done) {
      var badformatsepaxml = new SepaXML.createCredit('pain.001.001.04');
      badformatsepaxml.setHeaderInfo({
        messageId: 'ABC123',
        initiator: 'SepaXML'
      });

      var payment = new badformatsepaxml.createPayment({
        id: 'XYZ987',
        method: 'TRF'
      });

      payment.addTransaction({
        id: 'TRANSAC1',
        iban: 'NL21ABNA0531621583', // fake IBAN from https://www.generateiban.com/test-iban/ thanks
        name: 'generateiban',
        amount: 42
      });

      badformatsepaxml.addPayment(payment);

      badformatsepaxml.compile(function (err) {
        expect(err).to.be.exist;
        expect(err.code).to.be.equal('ENOENT');

        done();
      });
    });
  });
});
