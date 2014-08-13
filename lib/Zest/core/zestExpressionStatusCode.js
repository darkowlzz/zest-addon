'use strict';

const ELEMENT_TYPE = 'ZestExpressionStatusCode';

function ZestExpressionStatusCode(code) {
  let _code = code,
      _not = false,
      _elementType = ELEMENT_TYPE;

  this.__defineGetter__('code', function() {
    return _code;
  });
  this.__defineSetter__('code', function(val) {
    _code = val;
  });

  this.__defineGetter__('not', function() {
    return _not;
  });
  this.__defineSetter__('not', function(val) {
    _not = val;
  });

  this.__defineGetter__('elementType', function() {
    return _elementType;
  });
}

ZestExpressionStatusCode.prototype.isTrue = function(response) {
  let toReturn = this.code == response.get('status');
  let reason = null;
  if (!toReturn) {
    reason = 'Status Code: expected ' + this.code + ' got ' +
             response.get('status');
  }
  return {
    passed: toReturn,
    failReason: reason
  };
};

ZestExpressionStatusCode.prototype.toZest = function() {
  let zst = {
    'code': this.code,
    'not': this.not,
    'elementType': this.elementType
  };
  return zst;
};

exports.ZestExpressionStatusCode = ZestExpressionStatusCode;
