/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { Ci, Cc } = require('chrome');
let parser = Cc['@mozilla.org/xmlextras/domparser;1'].
             createInstance(Ci.nsIDOMParser);

function Source (data) {
  let _src = data;
  let doc = parser.parseFromString(_src, 'text/html');

  return doc;
}
exports.Source = Source;
