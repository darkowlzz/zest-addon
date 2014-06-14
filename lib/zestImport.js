const { read } = require('sdk/io/file');

function ZestImport() {
  this.zestObjects = [];
}

ZestImport.prototype = {
  zestObjects: null,
  count: null,

  add: function(ZstBlob) {
    this.zestObjects.push(ZstBlob);
  },

  remove: function(id) {
    let ele = this.getZestById(id);
    if (ele) {
      let index = this.zestObjects.indexOf(ele);
      this.zestObjects.splice(index, 1);
    }
  },

  getZest: function(id) {
    let ele = this.getZestById(id);
    if (ele) {
      return ele.getZstString();
    }
    else {
      console.log('element not found');
    }
  },

  getZestById: function(id) {
    for (let i of this.zestObjects) {
      if (i.id == id) {
        return i;
      }
    }
    return false;
  },

  importZest: function(path) {
    console.log('will import ' + path);
    let str = read(path);
    let z = JSON.parse(str);
    this.count++;
    let newZstBlob = new ZestBlob(str);
    newZstBlob.setId(this.count);
    this.add(newZstBlob);
    return {
      title: z.title,
      id: this.count
    }
  }
}

function ZestBlob(zst) {
  this.zstString = zst;
}

ZestBlob.prototype = {
  zstString: null,
  id: null,

  setId: function(id) {
    this.id = id;
  },

  getId: function() {
    return this.id;
  },

  getZstString: function() {
    return this.zstString;
  }
}

exports.ZestImport = ZestImport;
