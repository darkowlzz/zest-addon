/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const ELEMENT_TYPE = 'ZestComment';

function ZestComment(opts) {
  let _comment = opts.comment.comment,
      _index = opts.index || opts.comment.index,
      _elementType = ELEMENT_TYPE;

  this.__defineGetter__('comment', function() {
    return _comment;
  });
  this.__defineSetter__('comment', function(val) {
    _comment = val;
  });

  this.__defineGetter__('index', function() {
    return _index;
  });

  this.__defineSetter__('index', function(val) {
    _index = val;
  });

  this.__defineGetter__('elementType', function() {
    return _elementType;
  });
}

ZestComment.prototype.toZest = function() {
  let zst = {
    comment: this.comment,
    index: this.index,
    elementType: this.elementType
  };
  return zst;
};

exports.ZestComment = ZestComment;
