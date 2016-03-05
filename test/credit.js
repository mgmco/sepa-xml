'use strict';

var SepaXML = require('../index');
var expect = require('chai').expect;

var parseString = require('xml2js').parseString;

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

        expect(credit._payments[0]._info.transactionCount).to.be.equal(1);
        expect(credit._payments[0]._info.transactionControlSum).to.be.equal(42);
      });
    });
  });

  describe('Generate XML for `pain.001.001.02`', function () {
    var xml;

    before(function (done) {
      var credit = new SepaXML.createCredit('pain.001.001.02');

      credit.setHeaderInfo({
        messageId: 'ABC123',
        initiator: 'SepaXML'
      });

      var payment = new credit.createPayment({
        id: 'XYZ987',
        method: 'TRF',
        name: 'SepaXML',
        iban: 'NL40ABNA0453537696',
        bic: 'ABNANL2A'
      });

      payment.addTransaction({
        id: 'TRANSAC1',
        iban: 'NL21ABNA0531621583',
        name: 'generateiban',
        amount: 42
      });

      payment.addTransaction({
        id: 'TRANSAC2',
        iban: 'NL98ABNA0552572197',
        name: 'generateiban',
        amount: 10
      });

      credit.addPayment(payment);

      var payment2 = new credit.createPayment({
        id: 'XYZ987-2',
        method: 'TRF',
        name: 'SepaXML',
        iban: 'NL64RABO0141590870',
        bic: 'RABONL2U'
      });

      payment2.addTransaction({
        id: 'TRANSAC3',
        iban: 'NL21ABNA0531621583',
        name: 'generateiban',
        amount: 24
      });

      credit.addPayment(payment2);

      credit.compile(function (err, out) {
        parseString(out, {explicitArray: false}, function (err, result) {
          xml = result;

          done();
        });
      });
    });

    it('should correctly render header', function () {
      expect(xml.Document['pain.001.001.02'].GrpHdr.MsgId).to.be.equal('ABC123');
      expect(xml.Document['pain.001.001.02'].GrpHdr.CreDtTm).to.exist;
      expect(xml.Document['pain.001.001.02'].GrpHdr.NbOfTxs).to.be.equal('3');
      expect(xml.Document['pain.001.001.02'].GrpHdr.CtrlSum).to.be.equal('76');
      expect(xml.Document['pain.001.001.02'].GrpHdr.InitgPty.Nm).to.be.equal('SepaXML');
    });

    it('should correctly render payments', function () {
      expect(xml.Document['pain.001.001.02'].PmtInf.length).to.be.equal(2);

      expect(xml.Document['pain.001.001.02'].PmtInf[0].PmtInfId).to.be.equal('XYZ987');
      expect(xml.Document['pain.001.001.02'].PmtInf[0].PmtMtd).to.be.equal('TRF');
      expect(xml.Document['pain.001.001.02'].PmtInf[0].ReqdExctnDt).to.exist;
      expect(xml.Document['pain.001.001.02'].PmtInf[0].Dbtr.Nm).to.be.equal('SepaXML');
      expect(xml.Document['pain.001.001.02'].PmtInf[0].DbtrAcct.Id.IBAN).to.be.equal('NL40ABNA0453537696');
      expect(xml.Document['pain.001.001.02'].PmtInf[0].DbtrAgt.FinInstnId.BIC).to.be.equal('ABNANL2A');
    });

    it('should correctly render transaction', function () {
      expect(xml.Document['pain.001.001.02'].PmtInf[0].CdtTrfTxInf.length).to.be.equal(2);

      expect(xml.Document['pain.001.001.02'].PmtInf[0].CdtTrfTxInf[0].PmtId.EndToEndId).to.be.equal('TRANSAC1')
      expect(xml.Document['pain.001.001.02'].PmtInf[0].CdtTrfTxInf[0].Amt.InstdAmt._).to.be.equal('42')
      expect(xml.Document['pain.001.001.02'].PmtInf[0].CdtTrfTxInf[0].CdtrAgt.FinInstnId.BIC).to.be.equal('ABNANL2A')
      expect(xml.Document['pain.001.001.02'].PmtInf[0].CdtTrfTxInf[0].Cdtr.Nm).to.be.equal('generateiban')
      expect(xml.Document['pain.001.001.02'].PmtInf[0].CdtTrfTxInf[0].CdtrAcct.Id.IBAN).to.be.equal('NL21ABNA0531621583')
    });
  });

  describe('Generate XML for `pain.001.001.03`', function () {
    var xml;

    before(function (done) {
      var credit = new SepaXML.createCredit('pain.001.001.03');

      credit.setHeaderInfo({
        messageId: 'ABC123',
        initiator: 'SepaXML'
      });

      var payment = new credit.createPayment({
        id: 'XYZ987',
        method: 'TRF',
        name: 'SepaXML',
        iban: 'NL40ABNA0453537696',
        bic: 'ABNANL2A'
      });

      payment.addTransaction({
        id: 'TRANSAC1',
        iban: 'NL21ABNA0531621583',
        name: 'generateiban',
        amount: 42
      });

      payment.addTransaction({
        id: 'TRANSAC2',
        iban: 'NL98ABNA0552572197',
        name: 'generateiban',
        amount: 10
      });

      credit.addPayment(payment);

      var payment2 = new credit.createPayment({
        id: 'XYZ987-2',
        method: 'TRF',
        name: 'SepaXML',
        iban: 'NL64RABO0141590870',
        bic: 'RABONL2U'
      });

      payment2.addTransaction({
        id: 'TRANSAC3',
        iban: 'NL21ABNA0531621583',
        name: 'generateiban',
        amount: 24
      });

      credit.addPayment(payment2);

      credit.compile(function (err, out) {
        parseString(out, {explicitArray: false}, function (err, result) {
          xml = result;

          done();
        });
      });
    });

    it('should correctly render header', function () {
      expect(xml.Document.CstmrCdtTrfInitn.GrpHdr.MsgId).to.be.equal('ABC123');
      expect(xml.Document.CstmrCdtTrfInitn.GrpHdr.CreDtTm).to.exist;
      expect(xml.Document.CstmrCdtTrfInitn.GrpHdr.NbOfTxs).to.be.equal('3');
      expect(xml.Document.CstmrCdtTrfInitn.GrpHdr.CtrlSum).to.be.equal('76');
      expect(xml.Document.CstmrCdtTrfInitn.GrpHdr.InitgPty.Nm).to.be.equal('SepaXML');
    });

    it('should correctly render payments', function () {
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf.length).to.be.equal(2);

      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].PmtInfId).to.be.equal('XYZ987');
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].PmtMtd).to.be.equal('TRF');
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].NbOfTxs).to.be.equal('2');
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].CtrlSum).to.be.equal('52');
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].ReqdExctnDt).to.exist;
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].Dbtr.Nm).to.be.equal('SepaXML');
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].DbtrAcct.Id.IBAN).to.be.equal('NL40ABNA0453537696');
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].DbtrAgt.FinInstnId.BIC).to.be.equal('ABNANL2A');
    });

    it('should correctly render transaction', function () {
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].CdtTrfTxInf.length).to.be.equal(2);

      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].CdtTrfTxInf[0].PmtId.EndToEndId).to.be.equal('TRANSAC1')
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].CdtTrfTxInf[0].Amt.InstdAmt._).to.be.equal('42')
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].CdtTrfTxInf[0].CdtrAgt.FinInstnId.BIC).to.be.equal('ABNANL2A')
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].CdtTrfTxInf[0].Cdtr.Nm).to.be.equal('generateiban')
      expect(xml.Document.CstmrCdtTrfInitn.PmtInf[0].CdtTrfTxInf[0].CdtrAcct.Id.IBAN).to.be.equal('NL21ABNA0531621583')
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
        method: 'TRF',
        name: 'FooBar',
        iban: 'NL98ABNA0552572197',
        bic: 'ABNANL2A'
      });

      expect(payment._info).to.be.eql({
        id: 'XYZ987',
        method: 'TRF',
        batchBooking: false,
        bic: 'ABNANL2A',
        senderIBAN: 'NL98ABNA0552572197',
        senderName: 'FooBar'
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
