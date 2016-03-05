# SEPA-XML

This module gives you a wrapper around generating a SEPA XML file. It works by using [Handlebars](http://handlebarsjs.com/) to generate the file instead of using the conventional XML tree approach used by other plugins.

It does, however, run the final result through a validator and will throw an error if there's an issue with it!

## Formats

These can be found in the `formats` folders, and are simple Handlebars files representing the XML schema.

 * `pain.001.001.03`
 * `pain.001.001.02` (thanks [@PierrickP](https://github.com/PierrickP))
 * Want to add one? [Send us a pull request](https://github.com/mgmco/sepa-xml/compare/)!

## Usage

```javascript
var SepaXML = require('sepa-xml');
var credit = SepaXML.createCredit(); // takes a single argument which is the version, default is 'pain.001.001.03'

// This sets the header data in the file
credit.setHeaderInfo({
  id: '123/1',
  method: 'TRF',
  batchBooking: false
});

// Create payment batch
var payment = new credit.createPayment({
  id: 'XYZ987',
  method: 'TRF'
});

// Add transaction
payment.addTransaction({
  id: 'endToEndID',
  iban: 'NL21ABNA0531621583',
  name: 'generateiban',
  amount: 42
});

// add payment to credit
credit.addPayment(payment);

credit.compile(function (err, out) {
  // your XML data gets output here
});
```

## Contributing

 * Would be nice if someone wrote more templates for some of the other formats used for SEPA.
 * The BICS lookup list is probably not complete - it would be great if someone could add that data into [the map](https://github.com/mgmco/sepa-xml/blob/master/bics/list.js)
 * Anything else you can think of
