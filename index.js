'use strict';
var fs = require('then-fs');
var path = require('path');
var Promise = require('promise'); // jshint ignore:line
var parse = require('minimist');
var usage = require('./lib/usage');
var output = require('./lib/output');
var importer = require('./lib/import');

var argv = parse(process.argv.slice(2), {
  alias: {
    input: 'i',
    output: 'o',
    verbose: 'v'
  },
});

var importConfig = {
  database: '',
  output: ''
};

// make sure we have the right args - otherwise bomb
if (!argv.input || !argv.output) {
  console.error('Missing argument');
  usage();
}

argv.input = path.resolve(argv.input);
argv.output = path.resolve(argv.output);

// find the ghost database
fs.exists(argv.input)
  .then(function () {
    // check for the actual SQL file
    if (argv.input.slice(-3) === '.db') {
      return true;
    }

    // otherwise try to require in the ghost config
    var config = require(path.resolve(argv.input, 'config.js'));

    // try dev first as it's the default
    var dev = config.development.database;

    if (dev.client === 'sqlite3') {
      return fs.exists(dev.connection.filename).then(function () {
        importConfig.database = dev.connection.filename;
      });
    } else {
      throw new Error('Can\'t read ' + dev.client + ' - currently only sqlite3 is supported');
    }
  })
  .catch(function (error) { // input fail
    if (argv.verbose) {
      console.error(error.stack);
    }
    console.error('Failed to load ghost database');
    console.error(error.message);
    throw error;
  })
  .then(fs.exists(argv.output))
  .then(function () {
    // noop
  }, fs.mkdir(argv.output))
  .then(function () {
    importConfig.output = argv.output;
    return output.setup(importConfig.output);
  })
  .then(function () {
    return importer(importConfig);
  })
  .catch(function (error) {
    console.error(error.stack);
    console.error('Could not complete import process');
  });