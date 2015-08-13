# SEPA-XML

This module gives you a wrapper around generating a SEPA XML file. It works by using [Handlebars](http://handlebarsjs.com/) to generate the file instead of using the conventional XML tree approach used by other plugins.

It does, however, run the final result through a validator and will throw an error if there's an issue with it!

## Formats

These can be found in the `formats` folders, and are simple Handlebars files representing the XML schema.

 * `pain.001.001.03`
 * Want to add one? [Send us a pull request](https://github.com/mgmco/sepa-xml/compare/)!

## Usage
