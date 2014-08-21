/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { beautify, disableCache, setUserCachePref } = require('zestHelper');
const { sampleRequest } = require('dataSet');
const pref = require('sdk/preferences/service');

const CACHE_DISK = 'browser.cache.disk.enable';
const CACHE_MEMORY = 'browser.cache.memory.enable';

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

exports['test disableCache'] = function (assert) {
  pref.set(CACHE_DISK, true);
  pref.set(CACHE_MEMORY, true);
  let cacheDisk = pref.get(CACHE_DISK);
  let cacheMemory = pref.get(CACHE_MEMORY);
  assert.equal(cacheDisk, true, 'Cache disk set ON');
  assert.equal(cacheMemory, true, 'Cache Memory set ON');

  disableCache();
  cacheDisk = pref.get(CACHE_DISK);
  cacheMemory = pref.get(CACHE_MEMORY);
  assert.equal(cacheDisk, false, 'Cache disk disabled');
  assert.equal(cacheMemory, false, 'Cache memory disabled');
};

exports['test setUserCachePref'] = function (assert) {
  let cacheDisk = pref.get(CACHE_DISK);
  let cacheMemory = pref.get(CACHE_MEMORY);
  assert.equal(cacheDisk, false, 'Cache disk already disabled');
  assert.equal(cacheMemory, false, 'Cache memory already disabled');
  setUserCachePref();
  cacheDisk = pref.get(CACHE_DISK);
  cacheMemory = pref.get(CACHE_MEMORY);
  assert.equal(cacheDisk, true, 'Cache disk enabled');
  assert.equal(cacheMemory, true, 'Cache memory enabled');
};

require('sdk/test').run(exports);
