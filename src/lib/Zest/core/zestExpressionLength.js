/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const ELEMENT_TYPE = 'ZestExpressionLength';

function ZestExpressionLength(variable, length, approx) {
  let _length = length,
      _not = false,
      _approx = approx,
      _variableName = variable,
      _elementType = ELEMENT_TYPE;

  this.__defineGetter__('variableName', function() {
    return _variableName;
  });
  this.__defineSetter__('variableName', function(val) {
    _variableName = val;
  });

  this.__defineGetter__('length', function() {
    return _length;
  });
  this.__defineSetter__('length', function(val) {
    _length = val;
  });

  this.__defineGetter__('approx', function() {
    return _approx;
  });
  this.__defineSetter__('approx', function(val) {
    _approx = val;
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

ZestExpressionLength.prototype.isTrue = function(response) {
  let value = response.get(this.variableName);
  let toReturn = (Math.abs(this.length - value.length) <= 
                  (this.length * this.approx / 100));
  let reason = null;
  if (!toReturn) {
    reason = this.variableName + ' length: expected ' + this.length +
             ' got ' + value.length;
  }
  return { 
    passed: toReturn,
    failReason: reason
  };
};

ZestExpressionLength.prototype.toZest = function() {
  let zst = {
    length: this.length,
    approx: this.approx,
    variableName: this.variableName,
    not: this.not,
    elementType: this.elementType
  };
  return zst;
};

exports.ZestExpressionLength = ZestExpressionLength;
