/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { tinyRealZest } = require('dataSet');
const { send, setStandardResVariables,
        handleResponse } = require('zestRunner');
const { ZestObject } = require('zestObject');
const { Cu } = require('chrome');
const { Task } = Cu.import('resource://gre/modules/Task.jsm', {});

exports['test send and setStandardResVariables'] = function (assert, done) {
  let opts = {
    url: 'http://example.com',
    content: '',
    method: 'GET'
  };

  let opts2 = {
    type: 'existing',
    zest: tinyRealZest,
    withRespBody: true
  };
  let script = new ZestObject(opts2);
  let stmts = script.getStatements();
  let stmt = stmts[0];

  Task.spawn(function* () {
    let result = yield send(opts);
    return result;
  }).then((result) => {
    assert.equal(result.status, 200, 'response status correct');

    let resVar = setStandardResVariables(result);
    resVar.set('response.url', stmt.url);

    assert.equal(resVar.get('response.url'), 'http://gmail.com/',
                 'correct url');

    let r = handleResponse(stmt, resVar);
    for (let i in r) {
      assert.equal(r[i].passed, true, 'assertion true');
      assert.equal(r[i].failReason, null, 'correct reason');
    }
    done();
  }, (error) => {
    console.log('Error: ' + error);
  });
};

require('sdk/test').run(exports);
