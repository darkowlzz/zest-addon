'use strict';

const { ZestImport, ZestItem } = require('zestImport');
const { read } = require('sdk/io/file');
const { Cc, Ci } = require('chrome');
const currDir = Cc['@mozilla.org/file/directory_service;1'].
                getService(Ci.nsIDirectoryServiceProvider).
                getFile('CurWorkD', {}).path;

exports['test ZestImport'] = function (assert) {
  let path = currDir + '/test/sampleZest.zst';
  console.log('path: ' + path);
 
  let zi = new ZestImport();
  let z = zi.importZest(path);
  assert.equal(z.url, 'gmail', 'correct title received');

  let fileContent = read(path);
  fileContent = JSON.parse(fileContent);
  fileContent = JSON.stringify(fileContent);
  assert.equal(JSON.stringify(z.zest), fileContent, 'file content correct');

  let z1 = zi.getZestById(0);
  assert.equal(z1.id, 0, 'correct object id');
  assert.equal(z1.zest.title, 'gmail', 'correct title from stored object');

  let z2 = zi.getZestById(2);
  assert.equal(z2, false, 'element not found');

  zi.remove(0);
  let z3 = zi.getZestById(0);
  assert.equal(z3, false, 'element deleted');
};

exports['test ZestItem'] = function (assert) {
  let zi = new ZestItem('foo', 4);
  assert.equal(zi.id, 4, 'correct id');
  assert.equal(zi.zest, 'foo', 'correct zest');
};

require('sdk/test').run(exports);
