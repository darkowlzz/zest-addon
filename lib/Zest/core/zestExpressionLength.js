'use strict';

const ELEMENT_TYPE = 'ZestExpressionLength';

function ZestExpressionLength(variable, length, approx) {
  let _length = length,
      _not = false,
      _approx = approx,
      _variableName = variable,
      _elementType = ELEMENT_TYPE;

  this.setVariableName = function(variableName) {
    _variableName = variableName;
  };

  this.getVariableName = function() {
    return _variableName;
  };

  this.setLength = function(length) {
    _length = length;
  };

  this.getLength = function() {
    return _length;
  };

  this.setApprox = function(approx) {
    _approx = approx;
  };

  this.getApprox = function() {
    return _approx;
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

ZestExpressionLength.prototype.toZest = function() {
  let zst = {
    length: this.getLength(),
    approx: this.getApprox(),
    variableName: this.getVariableName(),
    not: this.getNot(),
    elementType: this.getElementType()
  };
  return zst;
};

exports.ZestExpressionLength = ZestExpressionLength;
