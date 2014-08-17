'use strict';

const utils = require('sdk/window/utils');
const { Cc, Ci } = require('chrome');
const fileIO = require('sdk/io/file');
const pref = require('sdk/preferences/service');

let { ZestObject } = require('zestObject');
let { run } = require('zestRunner');
let ZestLog = require('zestLog');
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

// Applies the changes in zest tree to the stored zest objects.
function treeChange(tree) {
  let b = ZestLog.getLogById(tree.id);
  let z = b.zest;
  z.moveStatement(tree.src, tree.dst);
  ZestLog.addToId(tree.id, z);
  return z.getZestString();
}
exports.treeChange = treeChange;

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
