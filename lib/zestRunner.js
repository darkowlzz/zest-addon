"use strict";

let Request = require('sdk/request').Request;
let timer = require('sdk/timers');
const { defer } = require('sdk/core/promise');

function run(data, type, worker) {
  let sidebarWorker = worker;
  requestAsync.count = 1;
  let count, stmt, stmts, zest;

  function doIt() {
    if (count < stmts.length) {
      switch (stmts[count].elementType) {
        case 'ZestRequest':
          requestAsync(stmts[count], sidebarWorker).then(function(result){
            count++;
            doIt();
          });
          break;

        case 'ZestComment':
          count++;
          doIt();
          break;

        default:
          count++;
          doIt();
      }
    }
  }

  if (type == 'zest') {
    zest = JSON.parse(data);
    stmts = zest.statements;
    count = 0;
    doIt();
  }
  else if (type == 'req') {
    stmt = JSON.parse(data);
    requestAsync(stmt, sidebarWorker, 1).then(function(result) {
    });
  }

}
exports.run = run;

function requestAsync(stmt, sidebarWorker) {
  let deferred = defer();

  let id = requestAsync.count;
  requestAsync.count++;
  let respBodyLength;

  let codePass = true;
  let codeFailDesc = '';

  let lengthPass = true;
  let lengthFailDesc = '';

  let regexPass = true;
  let regexFailDesc = '';

  let result = false;
  let resultFailDesc = '';

  let url = stmt.url;
  let method = stmt.method;
  let startTime, endTime;

  let aReq = Request({
    url: url,
    content: stmt.data,

    onComplete: (response) => {
      endTime = new Date().getTime();
      respBodyLength = response.headers['Content-Length'];
      // if the above length is undefined, calculate length from response text
      if (!respBodyLength) {
        respBodyLength = response.text.length;
      }

      for (let assert of stmt.assertions) {
        switch(assert.rootExpression.elementType) {

          case 'ZestExpressionStatusCode': 
            if (response.status == assert.rootExpression.code) {
              codePass = true;
            }
            else {
              codePass = false;
              codeFailDesc = 'Status Code: expected ' + assert.rootExpression.code + ' got ' + response.status;
            }
            break;

          case 'ZestExpressionLength':
            let approx = parseInt(assert.rootExpression.approx);
            let diff = parseInt(assert.rootExpression.length) * approx / 100;
            let upperLimit = parseInt(assert.rootExpression.length) + diff;
            let lowerLimit = parseInt(assert.rootExpression.length) - diff;

            switch(assert.rootExpression.variableName) {
              case 'response.body':
                if (respBodyLength <= upperLimit && respBodyLength >= lowerLimit) {
                  lengthPass = true;
                }
                else {
                  lengthPass = false;
                  lengthFailDesc = 'response.body length: expected ' + assert.rootExpression.length + ' got ' + respBodyLength;
                }
                break;

              case 'response.header':
                // XXX Find some way to make the response header usable here
                lengthPass = true;
                break;

              case 'response.url':
                if (url.length <= upperLimit && url.length >= lowerLimit) {
                  lengthPass = true;
                }
                else {
                  lengthPass = false;
                  lengthFailDesc = 'response.url length: expected ' + assert.rootExpression.length + ' got ' + url.length;
                }
                break;

              case 'request.body':
                if (stmt.data.length <= upperLimit && stmt.data.length >= lowerLimit) {
                  lengthPass = true;
                }
                else {
                  lengthPass = false;
                  lengthFailDesc = 'response.body length: expected ' + assert.rootExpression.length + ' got ' + respBodyLength;
                }
                break;

              // XXX ASK WHY ARE WE COMPARING REQUEST ATTRIBUETS !!!
              case 'request.header':
                lengthPass = true;
                break;

              case 'request.method':
                lengthPass = true;
                break;

              case 'request.url':
                lengthPass = true;
                break;

              default:
                lengthPass = false;

            }
            break;

          case 'ZestExpressionRegex':
            let regStr = assert.rootExpression.regex;
            let re = new RegExp(regStr, 'g');

            switch (assert.rootExpression.variableName) {
              case 'response.body':
                if (re.test(response.text)){
                  regexPass = true;
                }
                else {
                  regexPass = false;
                  regexFailDesc = 'FAILED Assert - ' + assert.rootExpression.variableName + ' does not include ' + regStr;
                }
                break;

              case 'response.header':
                // XXX Find some way to retrieve complete response header as str
                regexPass = true;
                break;

              case 'response.url':
                // XXX Find some way to retrieve response url
                regexPass = true;
                break;

              case 'request.body':
                if (re.test(stmt.body)) {
                  regexPass = true;
                }
                else {
                  regexPass = false;
                  regexFailDesc = 'FAILED Assert - ' + assert.rootExpression.variableName + ' does not include ' + regStr;
                }
                break;

              case 'request.header':
                if (re.test(stmt.headers)) {
                  regexPass = true;
                }
                else {
                  regexPass = false;
                  regexFailDesc = 'FAILED Assert - ' + assert.rootExpression.variableName + ' does not include ' + regStr;
                }
                break;

              case 'request.method':
                if (re.test(stmt.method)) {
                  regexPass = true;
                }
                else {
                  regexPass = false;
                  regexFailDesc = 'FAILED Assert - ' + assert.rootExpression.variableName + ' does not include ' + regStr;
                }
                break;

              case 'request.url':
                if (re.test(stmt.url)) {
                  regexPass = true;
                }
                else {
                  regexPass = false;
                  regexFailDesc = 'FAILED Assert - ' + assert.rootExpression.variableName + ' does not include ' + regStr;
                }
                break;

              default:
                regexPass = false;
            }

          default:
        }
      }

      if (codePass && lengthPass && regexPass) {
        result = true;
      }
      else {
        resultFailDesc = (codeFailDesc?(codeFailDesc + '\n'):'') + 
                         (lengthFailDesc?(lengthFailDesc + '\n'):'') +
                         (regexFailDesc?(regexFailDesc + '\n'):'');
      }

      let r = {
        'id': id,
        'method': method,
        'url': url,
        'respCode': response.status,
        'length': respBodyLength,
        'time': (endTime - startTime),
        'codePass': codePass,
        'lengthPass': lengthPass,
        'result': result,
        'resultDesc': resultFailDesc
      }

      sidebarWorker.port.emit('RESULT_RCV', r);

      deferred.resolve('done');
    }
  });

  switch (method) {
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

requestAsync.count = 1;
