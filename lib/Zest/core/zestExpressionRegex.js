'use strict';

const ELEMENT_TYPE = 'ZestExpressionRegex';

function ZestExpressionRegex(variable, regex, caseExact) {
  let _variableName = variable,
      _regex = regex,
      _caseExact = caseExact,
      _not = false,
      _elementType = ELEMENT_TYPE;

  this.__defineGetter__('variableName', function() {
    return _variableName;
  });
  this.__defineSetter__('variableName', function(val) {
    _variableName = val;
  });

  this.__defineGetter__('regex', function() {
    return _regex;
  });
  this.__defineSetter__('regex', function(val) {
    _regex = val;
  });

  this.__defineGetter__('caseExact', function() {
    return _caseExact;
  });
  this.__defineSetter__('caseExact', function(val) {
    _caseExact = val;
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

ZestExpressionRegex.prototype.isTrue = function(response) {
  let str = response.get(this.variableName);
  let re = new RegExp(this.regex, 'g');
  let toReturn = re.test(str);
  let reason = null;
  if (!toReturn) {
    reason = 'FAILED Assert - ' + this.variableName + ' does not include ' +
             this.regex;
  }
  return {
    passed: toReturn,
    failReason: reason
  };
};

ZestExpressionRegex.prototype.toZest = function() {
  let zst = {
    regex: this.regex,
    variableName: this.variableName,
    caseExact: this.caseExact,
    not: this.not,
    elementType: this.elementType
  };
  return zst;
};

exports.ZestExpressionRegex = ZestExpressionRegex;
