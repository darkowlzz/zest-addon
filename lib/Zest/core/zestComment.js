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
