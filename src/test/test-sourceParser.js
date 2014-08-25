/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { Source } = require('sourceParser');

exports['test sourceParser'] = function (assert) {
  let strSrc = '<html><body>' +
               '<p>Hello Monday</p><p>Hello Sunday</p>' +
               '</body><html>';
  let src = new Source(strSrc);
  let paraElements = src.getElementsByTagName('p');
  assert.equal(paraElements.length, 2, 'returns correct number of elements');

  let strSrc2 = '<form></form><form></form><form></form>';
  let src2 = new Source(strSrc2);
  let formElements = src2.getElementsByTagName('form');
  assert.equal(formElements.length, 3, 'returns correct number of elements');
};

require('sdk/test').run(exports);
