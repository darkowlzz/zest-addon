/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { ZestScript } = require('./Zest/core/zestScript');

exports['test zestScript with raw data'] = function (assert) {
  let opts = {
    type: 'raw',
    author: 'anon',
    generatedBy: 'foo',
    title: 'bar',
    description: 'a zest script'
  };
  let zs = new ZestScript(opts);
  assert.equal(zs.zestVersion, '0.3', 'returns correct version');
  assert.equal(zs.author, 'anon', 'returns correct author');
  assert.equal(zs.generatedBy, 'foo', 'returns correct generatedBy');
  assert.equal(zs.title, 'bar', 'returns correct title');
  assert.equal(zs.description, 'a zest script', 'returns correct desc');
  assert.equal(zs.elementType, 'ZestScript', 'returns correct type');

  zs.zestVersion = '0.4';
  assert.equal(zs.zestVersion, '0.4', 'returns correct version');
  zs.author = 'John Doe';
  assert.equal(zs.author, 'John Doe', 'returns correct author');
  zs.generatedBy = 'faa';
  assert.equal(zs.generatedBy, 'faa', 'returns correct generatedBy');
  zs.title = 'baz';
  assert.equal(zs.title, 'baz', 'returns correct title');
  zs.description = 'a zest';
  assert.equal(zs.description, 'a zest', 'returns correct desc');
  zs.elementType = 'ZestScripts';
  assert.equal(zs.elementType, 'ZestScripts', 'returns correct type');

  let temp1 = {
    x: 5,
    y: 1
  };
  let temp2 = {
    a: 10,
    b: 9
  };

  let temp = [];
  temp.push(temp1);
  temp.push(temp2);
  temp = JSON.stringify(temp);

  zs.addStatement(temp1);
  zs.addStatement(temp2);

  let s = zs.getStatements();
  s = JSON.stringify(s);
  assert.equal(s, temp, 'returns correct statements (all the stmts)');

  temp = JSON.stringify(zs.getStatement(1));
  s = JSON.stringify(temp2);
  assert.equal(s, temp, 'returns correct statement');

  zs.setStatements(temp1);
  temp = JSON.stringify(zs.getStatements());
  s = JSON.stringify(temp1);
  assert.equal(s, temp, 'sets correct statement');
};

require('sdk/test').run(exports);
