/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { ZestExpressionRegex } = require('./Zest/core/zestExpressionRegex');

exports['test zestExpressionRegex'] = function (assert) {
  let zer = new ZestExpressionRegex('foo', 'www', false);
  assert.equal(zer.variableName, 'foo', 'returns correct variable name');
  assert.equal(zer.regex, 'www', 'returns correct regex');
  assert.equal(zer.caseExact, false, 'returns correct caseExact');
  assert.equal(zer.not, false, 'returns correct not');
  assert.equal(zer.elementType, 'ZestExpressionRegex', 'correct type');

  zer.variableName = 'bar';
  assert.equal(zer.variableName, 'bar', 'returns correct variable name');
  zer.regex = 'http';
  assert.equal(zer.regex, 'http', 'returns correct regex');
  zer.caseExact = true;
  assert.equal(zer.caseExact, true, 'returns correct caseExact');
  zer.not = true;
  assert.equal(zer.not, true, 'returns correct not');

  let t1 = zer.toZest();
  t1 = JSON.stringify(t1);

  let t2 = {
    regex: 'http',
    variableName: 'bar',
    caseExact: true,
    not: true,
    elementType: 'ZestExpressionRegex'
  };
  t2 = JSON.stringify(t2);

  assert.equal(t1, t2, 'returns correct zest');
};

require('sdk/test').run(exports);
