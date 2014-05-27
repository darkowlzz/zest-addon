let { ZestScript } = require('Zest/core/zestScript');
let { ZestRequest } = require('Zest/core/zestRequest');

/**
 * ZestObject class
 * @param {Object} request
 *    Request object
 * @param {Object} response
 *    Response object
 */
function ZestObject (request, response) {
  this.script = new ZestScript('anon', 'zest-addon for firefox',
                               'sample title', 'sample description');
  this.counter += 1;
  let zstReq = new ZestRequest(this.counter, request, response);
  this.script.add(this.counter, zstReq);
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
