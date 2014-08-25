/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { foo } = require('bar');

exports['test foo'] = function (assert) {
  assert.equal(1, 1, 'success');
};

require('sdk/test').run(exports);
