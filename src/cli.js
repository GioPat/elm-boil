#!/usr/bin/env node
var fs = require('fs');
var log = require('./utils/log');
// var gulpfunc = require('./../gulpfile');
var copy = require('./utils/copy');
var path = require('path');

var tmpPath      =path.join(__dirname, './../tmp/');
var templatePath =path.join(__dirname, './../template');

/**
 * @param {string} projName Project name.
 */
function handleCreate(projName) {
  log.info(`Creating project: ${projName} in ${tmpPath}`);
  var projPath = path.join('./', projName);
  copy.copySync(templatePath, projPath)
}
 
function handleServe() {
  var nowTimestamp = new Date().getTime().toString();
  var servingPath = tmpPath + nowTimestamp;
  fs.mkdirSync(servingPath);
}

require('yargs')
  .command('create <projName>', 'new project', (yargs) => {
    yargs
      .positional('projName', {
        describe: 'Project name to create',
        require: true,
      })
  }, (argv) => {
    var projName = argv.projName
    handleCreate(projName);
  })
  .command('serve', 'project', (yargs) => {
    handleServe();
  })
.argv;