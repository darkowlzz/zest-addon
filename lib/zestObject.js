let { ZestScript } = require('Zest/core/zestScript');
let { ZestRequest } = require('Zest/core/zestRequest');
let { ZestAssertion } = require('Zest/core/zestAssertion');

/**
 * ZestObject class
 * @param {Object} request
 *    Request object
 * @param {Object} response
 *    Response object
 */
function ZestObject (requests, withRespBody) {
  this.script = new ZestScript('anon', 'zest-addon for firefox',
                               'sample title', 'sample description');

  for (let r of requests) {
    this.counter += 1;
    let zstReq = new ZestRequest(this.counter, r, withRespBody);
    let asrt = new ZestAssertion(r.Response);
    zstReq.addAssertion(asrt);
    this.script.add(zstReq);
  }
  this.zestString = this.script.getZestString();
}

ZestObject.prototype = {
  script: null,
  zestString: null,

  getString: function() {
    return this.zestString;
  }
}

ZestObject.prototype.counter = 0;

exports.ZestObject = ZestObject;
