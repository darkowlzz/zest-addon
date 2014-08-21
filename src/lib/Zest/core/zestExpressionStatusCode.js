/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
  let toReturn = this.code == response.get('response.status');
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
    code: this.code,
    not: this.not,
    elementType: this.elementType
  };
  return zst;
};

exports.ZestExpressionStatusCode = ZestExpressionStatusCode;
