/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { importZest } = require('zestImport');
const ZestLog = require('zestLog');
const { read } = require('sdk/io/file');
const { Cc, Ci } = require('chrome');
const currDir = Cc['@mozilla.org/file/directory_service;1'].
                getService(Ci.nsIDirectoryServiceProvider).
                getFile('CurWorkD', {}).path;

exports['test importZest'] = function (assert) {
  let path = currDir + '/test/sampleZest.zst';
 
  let z = importZest(path);
  assert.equal(z.title, 'gmail', 'correct title received');
  assert.equal(z.id, 0, 'correct id');

  let fileContent = read(path);
  fileContent = JSON.parse(fileContent);
  fileContent = JSON.stringify(fileContent);
  assert.equal(JSON.stringify(z.zest), fileContent, 'file content correct');

  ZestLog.clearAll();
};

require('sdk/test').run(exports);
