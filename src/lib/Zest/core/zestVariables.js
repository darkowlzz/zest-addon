/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

function ZestVariables() {

  this.REQUEST_URL     = 'request.url';
  this.REQUEST_METHOD  = 'request.method';
  this.REQUEST_HEADER  = 'request.header';
  this.REQUEST_BODY    = 'request.body';
  this.RESPONSE_URL    = 'response.url';
  this.RESPONSE_HEADER = 'response.header';
  this.RESPONSE_BODY   = 'response.body';

  let tokenStart  = '{{',
      tokenEnd    = '}}';

  let tokens = new Map();

  this.__defineGetter__('tokenStart', function() {
    return tokenStart;
  });
  this.__defineSetter__('tokenStart', function(val) {
    tokenStart = val;
  });

  this.__defineGetter__('tokenEnd', function() {
    return tokenEnd;
  });
  this.__defineSetter__('tokenEnd', function(val) {
    tokenEnd = val;
  });

  this.getVariable = function(name) {
    return tokens.get(name);
  };
  this.setVariable = function(name, value) {
    tokens.set(name, value); 
  };

  this.getVariables = function() {
    let list = [];
    tokens.forEach((value, key) => {
      list.push({name: key, value: value});
    });
    return list;
  };

  this.addVariable = function(name, value) {
    if (tokens.get(name) === undefined) {
      if (value !== null) {
        tokens.set(name, value);
      } else {
        tokens.set(name, name);
      }
    }
  };

  this.replaceInString = function(str, previous) {
    let prev = previous || [];
    if (str === '') {
      return str;
    }
    let changed = false;
    for (let variable of this.getVariables()) {
      let tokenStr = tokenStart + variable.name + tokenEnd;
      if (str.contains(tokenStr)) {
        if (prev.indexOf(tokenStr) === -1) {
          prev.push(variable.name);
          changed = true;
          str = str.replace(tokenStr, variable.value);
        }
      }
    }
    if (changed) {
      return this.replaceInString(str, prev);
    }
    return str;
  };
}
exports.ZestVariables = ZestVariables;
