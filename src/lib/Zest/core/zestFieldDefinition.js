/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const ELEMENT_TYPE = 'ZestFieldDefinition';

function ZestFieldDefinition (opts) {
  let _formIndex = opts.formIndex,
      _fieldName = opts.fieldName,
      _elementType = ELEMENT_TYPE;

  this.__defineGetter__('formIndex', function() {
    return _formIndex;
  });
  this.__defineSetter__('formIndex', function(val) {
    _formIndex = val;
  });

  this.__defineGetter__('fieldName', function() {
    return _fieldName;
  });
  this.__defineSetter__('fieldName', function(val) {
    _fieldName = val;
  });

  this.__defineGetter__('elementType', function() {
    return _elementType;
  });
}

ZestFieldDefinition.prototype.toZest = function() {
  let zst = {
    formIndex: this.formIndex,
    fieldName: this.fieldName,
    elementType: this.elementType
  };
  return zst;
};

exports.ZestFieldDefinition = ZestFieldDefinition;
