let Request = require('sdk/request').Request;
const { defer } = require('sdk/core/promise');

let count;
let sidebarWorker;

function run(zest, worker) {
  let zest = JSON.parse(zest);
  let stmts = zest.statements;
  sidebarWorker = worker;
  count = 0;

  function doIt() {
    if (count < stmts.length) {
      requestAsync(stmts[count], sidebarWorker).then(function(result){
        doIt();
      });
    }
  }

  doIt();
}
exports.run = run;

function requestAsync(stmt) {
  let deferred = defer();
  count++;

  let id = count;
  let contentLength;
  let codePass = false;
  let lengthPass = false;
  let result = false;
  let url = stmt.url;
  let method = stmt.method;

  let aReq = Request({
    url: url,
    content: stmt.data,

    onComplete: function(response) {
      for (let assert of stmt.assertions) {
        switch(assert.rootExpression.elementType) {

          case 'ZestExpressionStatusCode': 
            if (response.status == assert.rootExpression.code) {
              codePass = true;
            }
            break;
          case 'ZestExpressionLength':
            let approx = assert.rootExpression.approx;
            let diff = assert.rootExpression.length * approx / 100;
            let upperLimit = assert.rootExpression.length + diff;
            let lowerLimit = assert.rootExpression.length - diff;
            contentLength = response.headers['Content-Length'];

            if (contentLength <= upperLimit && contentLength >= lowerLimit) {
              lengthPass = true;
            }
        }
      }

      if (codePass && lengthPass) {
        result = true;
      }

      let r = {
        'id': id,
        'method': method,
        'url': url,
        'respCode': response.status,
        'length': contentLength,
        'time': '',
        'codePass': codePass,
        'lengthPass': lengthPass,
        'result': result
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

  return deferred.promise;
}
