/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { ZestExpressionLength } = require('./Zest/core/zestExpressionLength');

exports['test zestExpressionLength'] = function (assert) {
  let zel = new ZestExpressionLength('foo', 1000, 5);
  assert.equal(zel.variableName, 'foo', 'returns correct variable name');
  assert.equal(zel.length, 1000, 'returns correct length');
  assert.equal(zel.approx, 5, 'returns correct approx');
  assert.equal(zel.not, false, 'returns correct not');
  assert.equal(zel.elementType, 'ZestExpressionLength',
               'return correct type');

  zel.variableName = 'bar';
  assert.equal(zel.variableName, 'bar', 'returns correct variable name');
  zel.length = 999;
  assert.equal(zel.length, 999, 'returns correct length');
  zel.approx = 10;
  assert.equal(zel.approx, 10, 'returns correct approx');
  zel.not = true;
  assert.equal(zel.not, true, 'returns correct not');

  let x = {
    length: 999,
    approx: 10,
    variableName: 'bar',
    not: true,
    elementType: 'ZestExpressionLength'
  };
  x = JSON.stringify(x);

  let a = zel.toZest();
  a = JSON.stringify(a);

  assert.equal(a, x, 'returns correct zest');
};

require('sdk/test').run(exports);
