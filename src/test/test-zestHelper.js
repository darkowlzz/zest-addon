/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { beautify } = require('zestHelper');
const { sampleRequest } = require('dataSet');

exports['test beautify'] = function (assert) {
  let rawReq = [sampleRequest];
  let goodReq = beautify(rawReq);
  let req = goodReq[0];
  assert.equal(req.url, 'example.com', 'returns correct url');
  assert.equal(req.data, 'foo', 'returns correct data');
  assert.equal(req.method, 'GET', 'returns correct method');
  assert.equal(req.headers, 'aabbcc', 'returns correct headers');
  assert.equal(req.response.url, 'example.com', 'returns correct url');
  assert.equal(req.response.headers, 'xxxyyyzzz', 'returns correct headers');
  assert.equal(req.response.body, 'mmmm', 'returns correct body');
  assert.equal(req.response.statusCode, 200, 'returns correct statusCode');
  assert.equal(req.response.responseTimeInMs, 20, 'returns correct time');
  assert.equal(req.response.elementType, 'ZestResponse', 'correct type');
};

require('sdk/test').run(exports);
