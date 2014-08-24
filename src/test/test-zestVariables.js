/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { ZestVariables } = require('./Zest/core/zestVariables');

exports['test zestVariables'] = function (assert) {
  let zv = new ZestVariables();
  zv.addVariable('email', 'foo@mail.com');
  assert.equal(zv.getVariable('email'), 'foo@mail.com', 'returns correct var');
  zv.addVariable('password', '12345');

  zv.setVariable('email', 'bar@mail.com');
  assert.equal(zv.getVariable('email'), 'bar@mail.com', 'returns correct var');

  assert.equal(zv.tokenStart, '{{', 'returns correct start token');
  assert.equal(zv.tokenEnd, '}}', 'returns correct end token');

  let v = zv.getVariables();
  let v1 = {name: 'email', value: 'bar@mail.com'};
  assert.equal(JSON.stringify(v[0]), JSON.stringify(v1),
               'returns correct variable1');
  let v2 = {name: 'password', value: '12345'};
  assert.equal(JSON.stringify(v[1]), JSON.stringify(v2),
               'returns correct variable2');

  let aString = 'Email:{{email}}, username:{{email}}, pswd:{{password}}';
  let result = zv.replaceInString(aString);
  assert.equal(result, 'Email:bar@mail.com, username:bar@mail.com, pswd:12345',
               'correct replacement');
};

require('sdk/test').run(exports);
