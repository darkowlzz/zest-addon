/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const VERSION = '0.3';
const ZEST_URL = 'https://developer.mozilla.org/en-US/docs/Zest';
const ABOUT = 'This is a Zest script. For more details about Zest visit ' +
              ZEST_URL;
const ELEMENT_TYPE = 'ZestScript';

const DEFAULT_PARA = {
  "tokenStart": "{{",
  "tokenEnd": "}}",
  "tokens": {},
  "elementType": "ZestVariables"
};

/**
 * ZestScript class
 */
function ZestScript(opts) {
  let author, generatedBy, title, description, statements;
  let elementType = ELEMENT_TYPE,
      zestVersion = VERSION,
      about = ABOUT;

  author = opts.author;
  generatedBy = opts.generatedBy;
  title = opts.title;
  description = opts.description;
  statements = [];

  this.__defineGetter__('about', function() {
    return about;
  });
  this.__defineSetter__('about', function(val) {
    about = val;
  });

  this.__defineGetter__('zestVersion', function() {
    return zestVersion;
  });
  this.__defineSetter__('zestVersion', function(val) {
    zestVersion = val;
  });

  this.__defineGetter__('author', function() {
    return author;
  });
  this.__defineSetter__('author', function(val) {
    author = val;
  });

  this.__defineGetter__('title', function() {
    return title;
  });
  this.__defineSetter__('title', function(val) {
    title = val;
  });

  this.__defineGetter__('generatedBy', function() {
    return generatedBy;
  });
  this.__defineSetter__('generatedBy', function(val) {
    generatedBy = val;
  });

  this.__defineGetter__('description', function() {
    return description;
  });
  this.__defineSetter__('description', function(val) {
    description = val;
  });

  this.__defineGetter__('about', function() {
    return about;
  });
  this.__defineSetter__('about', function(val) {
    about = val;
  });

  this.__defineGetter__('elementType', function() {
    return elementType;
  });
  this.__defineSetter__('elementType', function(val) {
    elementType = val;
  });

  this.getStatement = function(index) {
    return statements[index];
  };

  this.getStatements = function() {
    return statements;
  };

  this.setStatements = function(stmts) {
    statements = stmts;
  };

  this.addStatement = function(stmt) {
    statements.push(stmt);
  };
}

ZestScript.prototype.moveStatement = function (src, dst) {
  let stmts = this.getStatements();
  let tempSrc = this.getStatement(src - 1);
  if (src > dst) {
    stmts.splice(dst, 0, tempSrc);
    stmts.splice(src, 1);
    for (let i = (dst - 1); i < stmts.length; i++) {
      stmts[i].index = i + 1;
    }
  }
  else if (dst > src) {
    stmts.splice(dst, 0, tempSrc);
    if (src === 1) {
      stmts.shift();
    }
    else {
      stmts.splice(src - 1, 1);
    }
    for (let i = (src - 1); i < stmts.length; i++) {
      stmts[i].index = i + 1;
    }
 }
  this.setStatements(stmts);
};

ZestScript.prototype.getZestJSON = function() {
  let tmp = [];
  try {
    for (let i of this.getStatements()) {
      tmp.push(i.toZest());
    }
  }
  catch(e) {
    console.log('Error in zestScript: ' + e);
  }
  let obj = {
    'about': this.about,
    'zestVersion': this.version,
    'title': this.title,
    'description': this.description,
    'prefix': '',
    'author': this.author,
    'generatedBy': this.generatedBy,
    'parameters': DEFAULT_PARA,
    'statements': tmp,
    'authentication': [],
    'index': 1,
    'elementType': this.elementType
  };
  return obj;
};

ZestScript.prototype.getZestString = function() {
  let json = this.getZestJSON();
  return JSON.stringify(json, undefined, 2);
};

exports.ZestScript = ZestScript;
