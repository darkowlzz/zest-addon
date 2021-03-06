/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { ZestComment } = require('./Zest/core/zestComment');

exports['test zestComment'] = function (assert) {
  let opts1 = {
    comment: {
      comment: 'a comment',
      index: 5,
      elementType: 'ZestComment'
    }
  };
  let zc = new ZestComment(opts1);
  assert.equal(zc.comment, 'a comment', 'returns correct comment');
  assert.equal(zc.index, 5, 'returns correct index');
  assert.equal(zc.elementType, 'ZestComment', 'returns correct type');

  let opts1 = JSON.stringify(opts1.comment);

  let zz = zc.toZest();
  zz = JSON.stringify(zz);
  assert.equal(zz, opts1, 'returns correct zest form');

  zc.comment = 'foo';
  assert.equal(zc.comment, 'foo', 'correct changed comment');
  zc.index = 4;
  assert.equal(zc.index, 4, 'correct changed index');
};

require('sdk/test').run(exports);
