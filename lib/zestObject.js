'use strict';

let { ZestScript } = require('Zest/core/zestScript');
let { ZestRequest } = require('Zest/core/zestRequest');
let { ZestComment } = require('Zest/core/zestComment');

/**
 * ZestObject class
 */
function ZestObject (opts) {
  let script;
  this.counter = 0;

  if (opts.type == 'new') {
    let scriptOpt = {
      author: 'anon',
      generatedBy: 'zest-addon for firefox',
      title: 'sample title',
      description: 'sample description'
    };
    script = new ZestScript(scriptOpt);
    let zstReq;

    // XXX For now, we record only req and res so the statements
    // are requests only.
    for (let r of opts.requests) {
      this.counter += 1;
      try {
        let opts2 = {
          type: 'new',
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
  else if (opts.type == 'existing') {
    let scriptOpt = {
      author: opts.zest.author || 'anon',
      generatedBy: opts.zest.generatedBy || 'unknown',
      title: opts.zest.title || 'untitled',
      description: opts.zest.description || 'no description'
    };
    script = new ZestScript(scriptOpt);

    let opts2, tempObj;

    for (let s of opts.zest.statements) {
      this.counter += 1;
      switch (s.elementType) {
        case 'ZestRequest':
          opts2 = {
            type: 'existing',
            request: s,
            withRespBody: opts.withRespBody
          };
          tempObj = new ZestRequest(opts2);
          script.addStatement(tempObj);
          break;
        case 'ZestComment':
          opts2 = {
            comment: s
          };
          tempObj = new ZestComment(opts2);
          script.addStatement(tempObj);
          break;
        case 'ZestConditional':
          break;
        default:
      }
    }
  }

  /*
  this.__defineGetter__('script', function() {
    return script;
  });
  this.__defineSetter__('script', function(val) {
    script = val;
  });

  this.getStatements = function() {
    return script.getStatements();
  }
  */

  return script;
}

/*
ZestObject.prototype.getString = function() {
  return this.script.getZestString();
};

ZestObject.prototype.getJSON = function() {
  return this.script.getZestJSON();
};
*/

//ZestObject.prototype.counter = 0;

exports.ZestObject = ZestObject;
