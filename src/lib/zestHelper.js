'use strict';

const utils = require('sdk/window/utils');
const { Cc, Ci } = require('chrome');
const fileIO = require('sdk/io/file');
const pref = require('sdk/preferences/service');

let { ZestObject } = require('zestObject');
let { run, runStmt } = require('zestRunner');
let { getLogById, addToId } = require('zestLog');
let { importZest } = require('zestImport');

const nsIFilePicker = Ci.nsIFilePicker;

const SAVE_DIALOG_TITLE = 'Save Zest';
const ZEST_FILE_FILTER = 'Zest Files';
const ZEST_FILE_EXTENSION = '.zst';
const IMPORT_DIALOG_TITLE = 'Import Zest';

const CACHE_DISK = 'browser.cache.disk.enable';
const CACHE_MEMORY = 'browser.cache.memory.enable';

// User cache pref
let userCacheDiskPref = null;
let userCacheMemoryPref = null;

// Create file picker instance
let fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);

// Refactors the request objects to make them compatible with zest runner.
function beautify (requests) {
  let cleanRequests = [];
  let temp;
  for (let r of requests) {
    temp = {
      url: r.url,
      data: r.data,
      method: r.method,
      headers: r.RequestHeaders,
      response: {
        url: r.Response.url,
        headers: r.Response.ResponseHeaders || '',
        body: r.Response.bodyListener.responseBody || '',
        statusCode: r.Response.statusCode || '',
        responseTimeInMs: r.Response.responseTimeInMs || 0,
        elementType: 'ZestResponse'
      }
    };
    cleanRequests.push(temp);
  }
  return cleanRequests;
}
exports.beautify = beautify;

// Formats a given zest and passes it to the runner.
function runThis(zest, worker) {
  let o = {
    type: 'existing',
    zest: JSON.parse(zest),
    withRespBody: false
  };
  let script = new ZestObject(o);
  run(script, worker);
}
exports.runThis = runThis;

function runNode(node, worker) {
  let target = node.nodeKey - 1;
  let b = getLogById(node.treeId);
  let z = b.zest;
  let req = z.getStatement(target);
  runStmt(req, worker);
}
exports.runNode = runNode;

// Applies the changes in zest tree node arrangement to the stored zest objects.
function treeChange(tree) {
  let b = getLogById(tree.id);
  let z = b.zest;
  z.moveStatement(tree.src, tree.dst);
  addToId(tree.id, z);
  return z.getZestString();
}
exports.treeChange = treeChange;

function changeAttr(node, worker) {
  console.log('APPLYING ATTRIBUTE CHANGE');
  let target = node.nodeKey - 1;
  let b = getLogById(node.treeId);
  let z = b.zest;
  let stmt = z.getStatement(target);
  if (node.changes.type == 'ZestRequest') {
    let changes = node.changes.attr;
    stmt.url = changes['request.url'];
    stmt.method = changes['request.method'];
    stmt.data = changes['request.body'];
    stmt.headers = changes['request.header'];
    let resp = stmt.response;
    resp.responseTime = changes['response.statusCode'];
    resp.headers = changes['response.header'];
    resp.body = changes['response.body'];
  }
  else if (node.changes.type == 'ZestComment') {
    stmt.comment = node.changes.attr;
  }
  else {
    let assertions = stmt.assertions;
    let assertion = assertions.expressions[node.id];
    switch (node.changes.type) {
      case 'ZestExpressionStatusCode':
        assertion.code = node.changes.code;
        break;

      case 'ZestExpressionLength':
        assertion.variableName = node.changes.variableName;
        assertion.length = node.changes.length;
        assertion.approx = node.changes.approx;
        break;

      case 'ZestExpressionRegex':
        assertion.variableName = node.changes.variableName;
        assertion.regex = node.changes.regex;
        assertion.caseExact = node.changes.caseSense;
        assertion.not = node.changes.inverse;
        break;
    }
  }
  addToId(node.treeId, z);
  worker.port.emit('UPDATE_TEXT_VIEW', z.getZestString());
}
exports.changeAttr = changeAttr;

// Imports a file and returns it's content.
function importFile() {
  let recentWindow = utils.getMostRecentBrowserWindow();
  fp.init(recentWindow, IMPORT_DIALOG_TITLE, nsIFilePicker.modeOpen);
  fp.appendFilter(ZEST_FILE_FILTER, ZEST_FILE_EXTENSION);
  let rv = fp.show();
  if (rv == nsIFilePicker.returnOK) {
    let path = fp.file.path;
    let importedZest = importZest(path);
    let z = {
      zest: JSON.stringify(importedZest.zest, undefined, 2),
      title: importedZest.title,
      id: importedZest.id
    };
    return z;
  }
  else {
    return false;
  }
}
exports.importFile = importFile;

// Saves zest into a file.
function saveZest(text) {
  let recentWindow = utils.getMostRecentBrowserWindow();
  fp.init(recentWindow, SAVE_DIALOG_TITLE, nsIFilePicker.modeSave);
  fp.appendFilter(ZEST_FILE_FILTER, ZEST_FILE_EXTENSION);
  let rv = fp.show();
  if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
    let path = fp.file.path;
    // file extension check
    let ext = path.slice(path.length - 4);
    if (ext !== ZEST_FILE_EXTENSION) {
      path += ZEST_FILE_EXTENSION;
    }
    let textWriter = fileIO.open(path, 'w');
    if (!textWriter.closed) {
      textWriter.write(text);
      textWriter.close();
    }
  }
}
exports.saveZest = saveZest;

// Disable browser cache
function disableCache() {
  // store the current pref
  userCacheDiskPref = pref.get(CACHE_DISK);
  userCacheMemoryPref = pref.get(CACHE_MEMORY);

  // disable caching
  pref.set(CACHE_DISK, false);
  pref.set(CACHE_MEMORY, false);
}
exports.disableCache = disableCache;

// Restore user cache pref
function setUserCachePref() {
  pref.set(CACHE_DISK, userCacheDiskPref);
  pref.set(CACHE_MEMORY, userCacheMemoryPref);
}
exports.setUserCachePref = setUserCachePref;
