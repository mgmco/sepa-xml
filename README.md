# SEPA-XML

This module gives you a wrapper around generating a SEPA XML file. It works by using [Handlebars](http://handlebarsjs.com/) to generate the file instead of using the conventional XML tree approach used by other plugins.

It does, however, run the final result through a validator and will throw an error if there's an issue with it!

## Formats

These can be found in the `formats` folders, and are simple Handlebars files representing the XML schema.

 * `pain.001.001.03`
 * Want to add one? [Send us a pull request](https://github.com/mgmco/sepa-xml/compare/)!

## Usage

```javascript
var SepaXML = require('sepa-xml');
var XMLFile = new SepaXML(); // takes a single argument which is the format, default is 'pain.001.001.03'

// This sets the header data in the file
XMLFile.setHeaderInfo({
  id: '123/1',
  method: 'TRF',
  batchBooking: false,
  senderName: 'Acme Co.',
  senderIBAN: 'NL39 RABO 0300 0652 64',
  bic: 'RABONL2U' // optional
});

// Add one of these for every transaction
XMLFile.addTransaction({
  id: 'endToEndID',
  amount: 10.00,
  name: 'My Name',
  iban: 'NL39 RABO 0300 0652 64'
});

XMLFile.compile(); // your XML data gets output here
```

_NOTE:_ in case of an error, `compile()` will output boolean `false` and console out the errors.

## Contributing

 * Would be nice if someone wrote more templates for some of the other formats used for SEPA.
 * The BICS lookup list is probably not complete - it would be great if someone could add that data into [the map](https://github.com/mgmco/sepa-xml/blob/master/bics/list.js)
