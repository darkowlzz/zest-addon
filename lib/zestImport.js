'use strict';

const { read } = require('sdk/io/file');

function ZestImport() {
  let zestObjects = [],
      count = 0;

  this.getZestById = function(id) {
    for (let z of zestObjects) {
      if (z.id == id) {
        return z;
      }
    }
    return false;
  };

  this.importZest = function(path) {
    let zString = read(path);
    let z = JSON.parse(zString);
    let newZItem = new ZestItem(z, count);
    count++;
    this.add(newZItem);
    return {
      url: z.title,
      zest: z
    };
  };

  this.add = function(zItem) {
    zestObjects.push(zItem);
  };

  this.remove = function(id) {
    let ele = this.getZestById(id);
    if (ele) {
      let index = zestObjects.indexOf(ele);
      zestObjects.splice(index, 1);
    }
  };
}
exports.ZestImport = ZestImport;

function ZestItem(zst, ident) {
  let id = ident,
      zest = zst;

  this.__defineGetter__('id', function() {
    return id;
  });
  this.__defineSetter__('id', function(val) {
    id = val;
  });

  this.__defineGetter__('zest', function() {
    return zest;
  });
  this.__defineSetter__('zest', function(val) {
    zest = val;
  })
}
exports.ZestItem = ZestItem;
