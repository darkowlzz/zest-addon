/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const ELEMENT_TYPE = 'ZestAssignString';

function ZestAssignString(opts) {
  let _string = opts.string,
      _variableName = opts.variableName,
      _index = opts.index,
      _elementType = ELEMENT_TYPE;

  this.__defineGetter__('string', function() {
    return _string;
  });
  this.__defineSetter__('string', function(val) {
    _string = val;
  });

  this.__defineGetter__('variableName', function() {
    return _variableName;
  });
  this.__defineSetter__('variableName', function(val) {
    _variableName = val;
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

ZestAssignString.prototype.assign = function(runtime) {
  return runtime.replaceVariablesInString(this.string);
};

ZestAssignString.prototype.toZest = function() {
  let zst = {
    string: this.string,
    variableName: this.variableName,
    index: this.index,
    elementType: this.elementType
  };
  return zst;
};

exports.ZestAssignString = ZestAssignString;
