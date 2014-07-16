let Request = require('sdk/request').Request;
let timer = require('sdk/timers');
const { defer } = require('sdk/core/promise');

//let count;
//let sidebarWorker;

function run(data, type, worker) {
  let sidebarWorker = worker;
  if (type == 'zest') {
    let zest = JSON.parse(data);
    let stmts = zest.statements;
    let count = 0;

    function doIt() {
      if (count < stmts.length) {
        count++;
        requestAsync(stmts[count], sidebarWorker, count).then(function(result){
          doIt();
        });
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

  let id = count;
  let contentLength;
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
      contentLength = response.headers['Content-Length'];
      // if the above length is undefined, calculate length from response text
      if (!contentLength) {
        contentLength = response.text.length;
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
            let approx = assert.rootExpression.approx;
            let diff = assert.rootExpression.length * approx / 100;
            let upperLimit = assert.rootExpression.length + diff;
            let lowerLimit = assert.rootExpression.length - diff;

            if (contentLength <= upperLimit && contentLength >= lowerLimit) {
              lengthPass = true;
            }
            else {
              lengthFailDesc = 'response.body length: expected ' + assert.rootExpression.length + ' got ' + contentLength;
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
        'length': contentLength,
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
