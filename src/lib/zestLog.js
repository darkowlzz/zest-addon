/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

let logs = [];
let count = 0;

// Insert a new entry into the log store.
function add(Zst) {
  if (typeof Zst == 'object') { // Make this filter stronger.
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

// Add/update zest to a given id.
// This could be used to update changes to a given zest.
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

// Remove log given an id.
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

// Clear the log store.
function clearAll() {
  logs = [];
  count = 0;
}
exports.clearAll = clearAll;

// Returns zest in json format give an id.
function getLogById(id) {
  for (let i of logs) {
    if (i.id == id) {
      return i;
    }
  }
}
exports.getLogById = getLogById;

// Returns zest in string given an id.
function getStringLogById(id) {
  let log = getLogById(id);
  if (log) {
    let l = {
      id: log.id,
      zest: log.zest.getZestString()
    };
    return l;
  }
  return false;
}
exports.getStringLogById = getStringLogById;

// Returns the number of logs stored.
function getLogCount() {
  return logs.length;
}
exports.getLogCount = getLogCount;
