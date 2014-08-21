/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { ZestFieldDefinition } = require('./Zest/core/zestFieldDefinition');

const ELEMENT_TYPE = 'ZestAssignFieldValue';

function ZestAssignFieldValue (opts) {
  let _variableName = opts.variableName,
      _index = opts.index,
      _fieldDefinition,
      _elementType = ELEMENT_TYPE;

  _fieldDefinition = new ZestFieldDefinition(opts.fieldDefinition);

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

  this.__defineGetter__('fieldDefinition', function() {
    return _fieldDefinition;
  });
  this.__defineSetter__('fieldDefinition', function(val) {
    _fieldDefinition = val;
  });

  this.__defineGetter__('elementType', function() {
    return _elementType;
  });
}

ZestAssignFieldValue.prototype.assign = function() {
  //XXX Requires a html parser
};

ZestAssignFieldValue.prototype.toZest = function() {
  let zst = {
    fieldDefinition: this.fieldDefinition.toZest(),
    variableName: this.variableName,
    elementType: this.elementType
  };
  return zst;
};

exports.ZestAssignFieldValue = ZestAssignFieldValue;
