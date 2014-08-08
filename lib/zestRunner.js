"use strict";

let Request = require('sdk/request').Request;
const { defer } = require('sdk/core/promise');

function run(data, type, worker) {
  //parseIt(data);
  let sidebarWorker = worker;
  requestAsync.count = 1;
  let count, stmt, stmts, zest;
  let current = {
    url: '',
    method: '',
    content: '',
    respStatusCode: '',
    respHeader: '',
    respBody: '',
    respTime: ''
  };
  let condition, block, result;
  function doIt() {
    if (count < stmts.length) {
      switch (stmts[count].elementType) {
        case 'ZestRequest':
          current.url = stmts[count].url;
          current.method = stmts[count].method;
          current.content = stmts[count].data;
          requestAsync(stmts[count], sidebarWorker).then(function(result){ // jshint ignore:line
            count++;
            current.respStatusCode = result.respCode;
            current.respTime = result.time;
            doIt();
          });
          break;

        case 'ZestComment':
          count++;
          doIt();
          break;

        case 'ZestCondition':
          block = stmt.rootExpression;
          switch (stmt.rootExpression.elementType) {
            case 'ZestExpressionStatusCode':
              result = checkConditionStatusCode(stmt, current);
              break;
            case 'ZestExpressionEquals':
              break;
            case 'ZestExpressionLength':
              break;
            case 'ZestExpressionRegex':
              break;
            default:
          }

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
    requestAsync(stmt, sidebarWorker, 1).then(function(result) { // jshint ignore:line

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

  let aReq = Request({ // jshint ignore:line
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
              codeFailDesc = 'Status Code: expected ' +
                             assert.rootExpression.code +
                             ' got ' + response.status;
            }
            break;

          case 'ZestExpressionLength':
            let approx = parseInt(assert.rootExpression.approx);
            let diff = parseInt(assert.rootExpression.length) * approx / 100;
            let upperLimit = parseInt(assert.rootExpression.length) + diff;
            let lowerLimit = parseInt(assert.rootExpression.length) - diff;

            switch(assert.rootExpression.variableName) {
              case 'response.body':
                if (respBodyLength <= upperLimit &&
                    respBodyLength >= lowerLimit) {
                  lengthPass = true;
                }
                else {
                  lengthPass = false;
                  lengthFailDesc = 'response.body length: expected ' +
                                   assert.rootExpression.length +
                                   ' got ' + respBodyLength;
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
                  lengthFailDesc = 'response.url length: expected ' +
                                   assert.rootExpression.length +
                                   ' got ' + url.length;
                }
                break;

              case 'request.body':
                if (stmt.data.length <= upperLimit &&
                    stmt.data.length >= lowerLimit) {
                  lengthPass = true;
                }
                else {
                  lengthPass = false;
                  lengthFailDesc = 'response.body length: expected ' +
                                   assert.rootExpression.length +
                                   ' got ' + respBodyLength;
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
                  regexFailDesc = 'FAILED Assert - ' +
                                  assert.rootExpression.variableName +
                                  ' does not include ' + regStr;
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
                  regexFailDesc = 'FAILED Assert - ' +
                                  assert.rootExpression.variableName +
                                  ' does not include ' + regStr;
                }
                break;

              case 'request.header':
                if (re.test(stmt.headers)) {
                  regexPass = true;
                }
                else {
                  regexPass = false;
                  regexFailDesc = 'FAILED Assert - ' +
                                  assert.rootExpression.variableName +
                                  ' does not include ' + regStr;
                }
                break;

              case 'request.method':
                if (re.test(stmt.method)) {
                  regexPass = true;
                }
                else {
                  regexPass = false;
                  regexFailDesc = 'FAILED Assert - ' +
                                  assert.rootExpression.variableName +
                                  ' does not include ' + regStr;
                }
                break;

              case 'request.url':
                if (re.test(stmt.url)) {
                  regexPass = true;
                }
                else {
                  regexPass = false;
                  regexFailDesc = 'FAILED Assert - ' +
                                  assert.rootExpression.variableName +
                                  ' does not include ' + regStr;
                }
                break;

              default:
                regexPass = false;
            }
            break;

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
      };

      sidebarWorker.port.emit('RESULT_RCV', r);

      deferred.resolve(r);
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

function parseIt(z) {

  let currentUrl, currentMethod, currentContent,
      respStatusCode, respHeader, respBody, respTime;

  let target = [];
  let block;
  let stmts = z.statements;

  for (stmt of stmts) {
    switch (stmt.elementType) {
      case 'ZestRequest':
        currentUrl = stmt.url;
        currentMethod = stmt.method;
        currentContent: stmt.data,
        // add support for assertions too
        target.push(block);
        break;
      case 'ZestCondition':
        switch (stmt.rootExpression.elementType) {
          case 'ZestExpressionStatusCode':
            block = {
              code: stmt.rootExpression.code,
              ifStmt: {
                print: 'status code matches'
              },
              elseStmt: {
                print: 'status code do not match'
              }
            };
            break;
          case 'ZestExpressionEquals':
            block = {
              varName: stmt.rootExpression.variableName,
              ifStmt: {
                print: 'variables equal'
              },
              elseStmt: {
                print: 'variables unequal'
              }
            };
            break;
          case 'ZestExpressionLength':
            block = {
              varName: stmt.rootExpression.variableName,
              ifStmt: {
                print: 'variables equal'
              },
              elseStmt: {
                print: 'variables unequal'
              }
            };
            break;
          case 'ZestExpressionRegex':
            block = {
              varName: stmt.rootExpression.variableName,
              ifStmt: {
                print: 'variables equal'
              },
              elseStmt: {
                print: 'variables unequal'
              }
            };
            break;
          default:
        }
        break;
      default:
    }
  }
  /*
  let zest = JSON.parse(data);
  
  for (let stmt in zest.statements) {
    switch (stmt.elementType) {
      case 'ZestRequest':
        break;

      case 'ZestComment':
        break;

      case 'ZestConditional':
        break;

      default:

    }
  }
  */
}
exports.parseIt = parseIt;
