'use strict';

let Request = require('sdk/request').Request;
const { Cu } = require('chrome');
const { Task } = Cu.import('resource://gre/modules/Task.jsm', {});
const { defer } = require('sdk/core/promise');

function run(script, worker) {
  let statements;
  let opts, resVar, runResult, lastResponse, lastRequest;
  let reqCount = 0;
  Task.spawn(function* () {
    statements = script.getStatements();
    for (let stmt of statements) {
      switch (stmt.elementType) {
        case 'ZestRequest':
          reqCount += 1;
          lastRequest = stmt;
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

/*
function setStandardReqVariables(request) {
  let reqMap = new Map();
  reqMap.set('request.url', request.url);
  reqMap.set('request.headers', request.headers);
  reqMap.set('request.method', request.method);
  reqMap.set('request.body', request.data);

  return reqMap;
};
exports.setStandardReqVariables = setStandardReqVariables;
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
