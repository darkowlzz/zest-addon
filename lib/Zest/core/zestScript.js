VERSION: '0.3',
ZEST_URL: 'https://developer.mozilla.org/en-US/docs/Zest',
ABOUT: 'This is a Zest script. For more details about Zest visit ' + this.ZEST_URL,


function ZestScript(title, description) {
  this.title = title;
  this.description = description;
}

ZestScript.prototype = {
  about: ABOUT,
  zestVersion: VERSION,
  generatedBy: null,
  author: null,
  title: null,
  description: null,
  prefox: null,
  type: null,
  parameters: null,
  statements: [],

  // Adds a new zest statment to the end of the script
  addToEnd: function(stmt) {
    this.add(this.statements.length, stmt);
  },

  add: function(index, stmt) {
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
  },


}
