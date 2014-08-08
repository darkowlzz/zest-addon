'use strict';

const ELEMENT_TYPE = 'ZestExpressionStatusCode';

function ZestExpressionStatusCode(code) {
  let _code = code,
      _not = false,
      _elementType = ELEMENT_TYPE;

  this.setCode = function(code) {
    _code = code;
  };

  this.getCode = function() {
    return _code;
  };

  this.setNot = function(not) {
    _not = not;
  };

  this.getNot = function() {
    return _not;
  };

  this.getElementType = function() {
    return _elementType;
  };
}

ZestExpressionStatusCode.prototype.toZest = function() {
  let zst = {
    'code': this.getCode(),
    'not': this.getNot(),
    'elementType': this.getElementType()
  };
  return zst;
};

exports.ZestExpressionStatusCode = ZestExpressionStatusCode;
