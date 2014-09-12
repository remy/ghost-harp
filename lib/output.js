'use strict';
var fs = require('then-fs');
var path = require('path');
var root = '';

function touch(filename) {
  return fs.writeFile(path.resolve(root, filename), '\n', 'utf8');
}

function mkdir(dir) {
  return fs.mkdir(path.resolve(root, dir));
}

function makeDirectories() {
  return touch('harp.json')
    .then(mkdir('public'))
    .then(mkdir('public/blog'))
    .then(mkdir('public/blog/_drafts'))
}


module.exports = {
  setup: function (outputRoot) {
    root = outputRoot;
    return makeDirectories();
  }
};