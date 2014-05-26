let { ZestScript } = require('Zest/core/zestScript');

/**
 * ZestObject class
 * @param {Object} request
 *    Request object
 * @param {Object} response
 *    Response object
 */
function ZestObject (request, response) {
  console.log('Creating zestObject');
  this.script = new ZestScript('anon', 'zest-addon for firefox', 'sample title', 'sample description');
  this.zestString = this.script.getZestString();
}

ZestObject.prototype = {
  script: null,
  zestString: null,

  getString: function() {
    return this.zestString;
  }
}

exports.ZestObject = ZestObject;
