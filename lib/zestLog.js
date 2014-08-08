'use strict';

let logs = [];
let count = 0;

function add(Zst) {
  if (typeof Zst == 'object') {
    let z = {
      zest: Zst,
      id: count
    };
    count++;
    logs.push(z);
    return z.id;
  }
  else {
    console.log('Error: We store only objects, string not allowed');
    return false;
  }
}
exports.add = add;

function addToId(id, Zst) {
  try {
    remove(id);
    let z = {
      zest: Zst,
      id: id
    };
    logs.push(z);
    return true;
  }
  catch(e) {
    console.log('Error in ZestLog: ' + e);
    return false;
  }
}
exports.addToId = addToId;

function remove(id) {
  let ele = getLogById(id);
  if (ele) {
    let index = logs.indexOf(ele);
    logs.splice(index, 1);
  }
  else {
    throw 'element with id ' + id + ' not found';
  }
}
exports.remove = remove;

function clearAll() {
  logs = [];
}
exports.clearAll = clearAll;

function getLogById(id) {
  for (let i of logs) {
    if (i.id == id) {
      return i;
    }
  }
}
exports.getLogById = getLogById;

function getStringLogById(id) {
  let log = getLogById(id);
  if (log) {
    let l = {
      id: log.id,
      zest: JSON.stringify(log.zest, undefined, 2)
    }
    return l;
  }
  return false;
}
exports.getStringLogById = getStringLogById;

function getLogCount() {
  return logs.length;
}
exports.getLogCount = getLogCount;
