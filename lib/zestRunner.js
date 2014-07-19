let Request = require('sdk/request').Request;
let timer = require('sdk/timers');
const { defer } = require('sdk/core/promise');

function run(data, type, worker) {
  let sidebarWorker = worker;
  if (type == 'zest') {
    let zest = JSON.parse(data);
    let stmts = zest.statements;
    let count = 0;

    function doIt() {
      if (count < stmts.length) {
        requestAsync(stmts[count], sidebarWorker, count).then(function(result){
          doIt();
        });
        count++;
      }
    }

    doIt();
  }
  else if (type == 'req') {
    let stmt = JSON.parse(data);
    requestAsync(stmt, sidebarWorker, 1).then(function(result) {
    });
  }
}
exports.run = run;

function requestAsync(stmt, sidebarWorker, count) {
  let deferred = defer();

  let id = count + 1;
  let respBodyLength;
  let codePass = false;
  let codeFailDesc = '';
  let lengthPass = false;
  let lengthFailDesc = '';
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
              codeFailDesc = 'Status Code: expected ' + assert.rootExpression.code + ' got ' + response.status;
            }
            break;
          case 'ZestExpressionLength':
            let approx = parseInt(assert.rootExpression.approx);
            let diff = parseInt(assert.rootExpression.length) * approx / 100;
            let upperLimit = parseInt(assert.rootExpression.length) + diff;
            let lowerLimit = parseInt(assert.rootExpression.length) - diff;

            /*
            if (assert.rootExpression.variableName == 'response.body') {
              if (respBodyLength <= upperLimit && respBodyLength >= lowerLimit) {
                lengthPass = true;
              }
              else {
                lengthFailDesc = 'response.body length: expected ' + assert.rootExpression.length + ' got ' + respBodyLength;
              }
            }
            */

            switch(assert.rootExpression.variableName) {
              case 'response.body':
                if (respBodyLength <= upperLimit && respBodyLength >= lowerLimit) {
                  lengthPass = true;
                }
                else {
                  lengthFailDesc = 'response.body length: expected ' + assert.rootExpression.length + ' got ' + respBodyLength;
                }
                break;

              case 'response.header':
                break;

              case 'response.url':
                if (url.length <= upperLimit && url.length >= lowerLimit) {
                  lengthPass = true;
                }
                else {
                  lengthFailDesc = 'response.url length: expected ' + assert.rootExpression.length + ' got ' + url.length;
                }
                break;

              // This is temporary. Would be fixed after some investigation.
              case 'request.body':
                lengthPass = true;
                break;

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

        }
      }

      if (codePass && lengthPass) {
        result = true;
      }
      else {
        resultFailDesc = codeFailDesc + '\n' + lengthFailDesc;
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
