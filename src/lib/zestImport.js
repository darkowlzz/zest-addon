/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { read } = require('sdk/io/file');
const { ZestObject } = require('zestObject');
const ZestLog = require('zestLog');

function importZest(path) {
  let zString = read(path);
  let z = JSON.parse(zString);
  let opts2 = {
    type: 'existing',
    zest: z,
    withRespBody: true
  };
  let script = new ZestObject(opts2);
  let id = ZestLog.add(script);

  return {
    title: z.title,
    zest: z,
    id: id
  };
}
exports.importZest = importZest;
