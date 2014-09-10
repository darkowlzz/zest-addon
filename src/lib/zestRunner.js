/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { Request } = require('sdk/request');
const { Cu } = require('chrome');
const { Task } = Cu.import('resource://gre/modules/Task.jsm', {});
const { defer } = require('sdk/core/promise');
//const { ZestVariables } = require('Zest/core/zestVariables');

/**
 * Given a `script` and `worker`, steps through every statement in the script
 * and run each statement. Use the `worker` to communicate back to the sidebar
 * as the results are received.
 * @param {Object} script
 *    A ZestScript object.
 * @param {Object} worker
 *    A worker object.
 */
function run(script, worker) {
  let statements, opts, resVar, runResult, lastResponse, lastRequest,
      reqCount = 0;
  //let variables = new ZestVariables();

  Task.spawn(function* () {
    statements = script.getStatements();
    for (let stmt of statements) {
      // check if the statement is a comment.
      if (stmt.enabled === false) {
        continue;
      }

      reqCount += 1;
      lastRequest = stmt;
      switch (stmt.elementType) {
        case 'ZestRequest':
          opts = {
            url: stmt.url,
            content: stmt.data,
            method: stmt.method
          };
          let result = yield send(opts);
          lastResponse = result;
          resVar = setStandardResVariables(lastResponse);
          resVar.set('response.url', stmt.url); // couldn't get url from resp
          runResult = {
            id: reqCount,
            method: lastRequest.method,
            url: lastRequest.url,
            respCode: lastResponse.status,
            length: resVar.get('response.body').length,
            time: lastResponse.time,
            result: handleResponse(lastRequest, resVar),
          };
          worker.port.emit('RESULT_RCV', runResult);
          break;
        case 'ZestConditional':
          break;
        case 'ZestAction':
          break;
        case 'ZestAssignment':
          break;
        case 'ZestAssignString':
          break;
        case 'ZestLoop':
          break;
        case 'ZestControlLoopNext':
          break;
        case 'ZestControlLoopReturn':
          break;
        case 'ZestComment':
          break;
        case 'ZestClient':
          break;
        default:
      }
    }
  }).then((result) => { // jshint ignore:line
    console.log('Run completed!');
  }, (error) => {
    console.log('Error: ' + error);
  });
}
exports.run = run;

/**
 * Given a `stmt` and a `worker`, runs the statement and communicates back the
 * result to the sidebar using the `worker`.
 * @param {Object} stmt
 *    A ZestStatement object (like ZestRequest).
 * @param {Object} worker
 *    A worker object.
 */
function runStmt(stmt, worker) {
  let opts, resVar, runResult;
  Task.spawn(function* () {
    if (stmt.elementType == 'ZestRequest') {
      opts = {
        url: stmt.url,
        content: stmt.data,
        method: stmt.method
      };
      let result = yield send(opts);
      resVar = setStandardResVariables(result);
      resVar.set('response.url', stmt.url);
      runResult = {
        id: 1,
        method: stmt.method,
        url: stmt.url,
        respCode: resVar.get('response.status'),
        length: resVar.get('response.body').length,
        time: resVar.get('response.time'),
        result: handleResponse(stmt, resVar)
      };
      worker.port.emit('RESULT_RCV', runResult);
    }
    else {
      return;
    }
  });
}
exports.runStmt = runStmt;

/**
 * Sends requests to the specified `url` with the given `content` and `method`.
 * @param {Object} opts
 *    An object with properties `url`, `content` and `method`.
 * @return {Object} promise
 *    Returns a promise object which when resolved gives `time`, `status`,
 *    `header`, `text` of the response.
 */
function send(opts) {
  let deferred = defer();
  let startTime, endTime;
  let aReq = Request({ // jshint ignore:line
    url: opts.url,
    content: opts.content,
    onComplete: (response) => {
      endTime = new Date().getTime();
      let data = {
        time: (endTime - startTime),
        status: response.status,
        headers: response.headers,
        text: response.text
      };
      deferred.resolve(data);
    }
  });
  switch (opts.method) {
    case 'GET':
      aReq.get();
      break;
    case 'POST':
      aReq.post();
      break;
    case 'PUT':
      aReq.put();
      break;
    case 'HEAD':
      aReq.head();
      break;
    case 'DELETE':
      aReq.delete();
      break;
    default:
      console.log('Unknown request method');
      return;
  }
  startTime = new Date().getTime();

  return deferred.promise;
}
exports.send = send;

/**
 * Performs check on the response received with the assertions of ZestRequest.
 * @param {Object} req
 *    A ZestRequest object.
 * @param {Object} res
 *    A standardized response object with all the response attributes.
 * @return {Object} result
 *    An array object consisting of objects with attributes `passed` and
 *    `failReason`.
 *    Example:
 *    [{ passed: true, failReason: null}]
 */
function handleResponse(req, res) {
  let result = [],
      currResult;
  for (let za of req.assertions.expressions) {
    currResult = za.isTrue(res);
    result.push(currResult);
  }
  return result;
}
exports.handleResponse = handleResponse;

/**
 * Organizes the response data in a standard form.
 * @param {Object} response
 *    A response object returned by a request.
 * @return {Object} resMap
 *    A Map object with the organized response attributes.
 */
function setStandardResVariables(response) {
  let resMap = new Map();
  resMap.set('response.status', response.status);
  resMap.set('response.url', response.url);
  resMap.set('response.headers', response.headers);
  resMap.set('response.body', response.text);
  resMap.set('response.time', response.time);

  return resMap;
}
exports.setStandardResVariables = setStandardResVariables;
