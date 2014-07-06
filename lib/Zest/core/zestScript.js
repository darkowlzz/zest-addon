const VERSION = '0.3';
const ZEST_URL = 'https://developer.mozilla.org/en-US/docs/Zest';
const ABOUT = 'This is a Zest script. For more details about Zest visit ' + ZEST_URL;

DEFAULT_PARA = {
  "tokenStart": "{{",
  "tokenEnd": "}}",
  "tokens": {},
  "elementType": "ZestVariables"
}

/**
 * ZestScript class
 * @param {String} author
 *    The name of the author.
 * @param {String} app
 *    The app name which is used to generate this zest script.
 * @param {String} title
 *    Title of the script.
 * @param {String} description
 *    Description of the script.
 */
function ZestScript(author, app, title, description) {
  this.author = author;
  this.generatedBy = app;
  this.title = title;
  this.description = description;
  this.statements = []; // Clear the previous statements, fix for issue#36
}

ZestScript.prototype = {
  about: ABOUT,
  zestVersion: VERSION,
  generatedBy: null,
  author: null,
  title: null,
  description: null,
  prefix: null,
  type: null,
  parameters: null,
  statements: [],
  authentication: [],
  elementType: 'ZestScript',

  // Adds a new zest statment to the end of the script
  addToEnd: function(stmt) {
    this.add(this.statements.length, stmt);
  },

  add: function(stmt) {
    this.statements.push(stmt);
    /*
    let prev = this;
    if (index == this.statements.length) {
      this.statements.push(stmt);
    }
    else {
      this.statements.splice(index, 0, stmt);
    }
    if (index > 0) {
      prev = this.statements[index-1];
    }

    stmt.insertAfter(prev);
    */
  },

  move: function(index, req) {
    
  },

  remove: function(req) {
  
  },

  removeStatement: function(index) {
  
  },

  getStatement: function(index) {
  
  },

  getTitle: function() {
    return this.title;
  },

  setTitle: function(title) {
    this.title = title;
  },

  getDescription: function() {
    return this.description;
  },

  setDescription: function(description) {
    this.description = description;
  },

  getStatements: function() {
    return statements;
  },

  setStatements: function(statements) {
    this.statements = statements;
  },

  addAuthentication: function(auth) {
    this.authentication.push(auth);
  },

  setAuthentication: function(authentication) {
    this.authentication = authentication;
  },

  getPrefix: function() {
    return this.prefix;
  },

  setPrefix: function(newPrefix) {
    this.prefix = newPrefix;
  },

  getParameters: function() {
    return this.parameters;
  },

  setParameters: function(parameters) {
    this.parameters = parameters;
  },

  getZestVersion: function() {
    return this.zestVersion;
  },

  setZestVersion: function(zestVersion) {
    this.zestVersion = zestVersion;
  },

  getGeneratedBy: function() {
    return this.generatedBy;
  },

  setGeneratedBy: function(generatedBy) {
    this.generatedBy = generatedBy;
  },

  getAbout: function() {
    return this.about;
  },

  setAbout: function(about) {
    this.about = about;
  },

  getAuthor: function() {
    return this.author;
  },

  setAuthor: function(author) {
    this.author = author;
  },

  // Implement later
  //getVariableNames: function() {}

  getIndex: function(child) {
    return this.statements.indexOf(child);
  },

  getElementType: function() {
    return this.elementType;
  },

  // Stringify and return zest attributes
  getZestString: function() {
    let tmp = [];
    for (let i of this.statements) {
      tmp.push(i.toZest());
    }
    let obj = {
      'about': this.getAbout(),
      'zestVersion': this.getZestVersion(),
      'title': this.getTitle(),
      'description': this.getDescription(),
      'prefix': '',
      'author': this.getAuthor(),
      'generatedBy': this.getGeneratedBy(),
      'parameters': DEFAULT_PARA,
      'statements': tmp,
      'authentication': [],
      'index': 1,
      'elementType': this.getElementType()
    }

    // stringify and set json tabspace length
    return JSON.stringify(obj, undefined, 2);
  }
}

exports.ZestScript = ZestScript;
