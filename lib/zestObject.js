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
function ZestObject (requests) {
  console.log('CREATING A NEW SCRIPT');
  this.script = new ZestScript('anon', 'zest-addon for firefox',
                               'sample title', 'sample description');

  for (let r of requests) {
    console.log('ADDING ' + r.url);
    this.counter += 1;
    let zstReq = new ZestRequest(this.counter, r);
    let asrt = new ZestAssertion(r.Response);
    zstReq.addAssertion(asrt);
    this.script.add(zstReq);
  }
  this.zestString = this.script.getZestString();
  console.log('SCRIPT: ' + this.zestString);
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
