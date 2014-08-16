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
};

require('sdk/test').run(exports);
