'use strict';

let { ZestScript } = require('Zest/core/zestScript');
let { ZestRequest } = require('Zest/core/zestRequest');
let { ZestAssertion } = require('Zest/core/zestAssertion');

/**
 * ZestObject class
 */
function ZestObject (opts) {
  let script;
  if (opts.type == 'raw') {
    let scriptOpt = {
      author: 'anon',
      generatedBy: 'zest-addon for firefox',
      title: 'sample title',
      description: 'sample description'
    }
    script = new ZestScript(scriptOpt);
    let zstReq, asrt;

    // XXX For now, we record only req and res so the statements
    // are requests only.
    for (let r of opts.requests) {
      this.counter += 1;
      try {
        let opts2 = {
          type: 'raw',
          index: this.counter,
          request: r,
          withRespBody: opts.withRespBody
        };
        zstReq = new ZestRequest(opts2);
      }
      catch (e) {
        console.log('Error at ZestObject: ' + e);
        zstReq = '';
      }

      script.addStatement(zstReq);
    }
  }
  else if (opts.type == 'json') {
    let scriptOpt = {
      author: opts.zest.author || 'anon',
      generatedBy: opts.zest.generatedBy || 'unknown',
      title: opts.zest.title || 'untitled',
      description: opts.zest.description || 'no description'
    };
    script = new ZestScript(scriptOpt);

    for (let s of opts.zest.statements) {
      switch (s.elementType) {
        case 'ZestRequest':
          let tzr = new ZestRequest()
          break;
        case 'ZestComment':
          break;
        case 'ZestConditional':
          break;
        default:
      }
    }
  }

  this.__defineGetter__('script', function() {
    return script;
  });
  this.__defineSetter__('script', function(val) {
    script = val;
  });
}

ZestObject.prototype.getString = function() {
  return this.script.getZestString();
};

ZestObject.prototype.getJSON = function() {
  return this.script.getZestJSON();
};

ZestObject.prototype.counter = 0;

exports.ZestObject = ZestObject;
