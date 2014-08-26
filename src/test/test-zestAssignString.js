/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { ZestAssignString } = require('Zest/core/zestAssignString');

exports['test zestAssignString'] = function (assert) {
  let opts = {
    string: 'xxyyzz',
    variableName: 'foo',
    index: 3
  };
  let zas = new ZestAssignString(opts);

  assert.equal(zas.string, 'xxyyzz', 'returns correct string');
  assert.equal(zas.variableName, 'foo', 'returns correct variable name');
  assert.equal(zas.index, 3, 'returns correct inedx');
  assert.equal(zas.elementType, 'ZestAssignString', 'correct type');

  zas.string = 'aabbcc';
  zas.variableName = 'bar';
  zas.index = 2;

  assert.equal(zas.string, 'aabbcc', 'returns correct string');
  assert.equal(zas.variableName, 'bar', 'returns correct variable name');
  assert.equal(zas.index, 2, 'returns correct inedx');

  let opts2 = {
    string: 'aabbcc',
    variableName: 'bar',
    index: 2,
    elementType: 'ZestAssignString'
  };

  let tmp = JSON.stringify(opts2);
  let tmp2 = JSON.stringify(zas.toZest());
  assert.equal(tmp2, tmp, 'correct zest');
};

require('sdk/test').run(exports);
