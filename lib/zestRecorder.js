"use strict";

/* Library imports */
const { Cc, Ci, Cr, Cu } = require('chrome');
let tabs_tabs = require('sdk/tabs/utils');
let sdk_tabs = require('sdk/tabs');
let window = require('sdk/window/utils');
let { ZestObject } = require('zestObject');
let ZestLog = require('zestLog');
let ZestRunner = require('zestRunner');

let observerService = Cc['@mozilla.org/observer-service;1'].
                      getService(Ci.nsIObserverService);

Cu.import('resource://gre/modules/XPCOMUtils.jsm');


/* Receive signal constants */
const SIG_LOCKTAB = 'LOCKTAB';
const SIG_GET_JSON = 'SHOWJSON';
const SIG_CLEAR_LOGS = 'CLEAR';
const SIG_WITH_RESPONSE_BODY = 'WITHRESPBODY';

/* Emit signal constants */
const SIG_MONITOR_SIGNAL = 'MONITORSIG';
const SIG_RCV_JSON = 'VIEWJSON';
const SIG_LOG_REQUEST = 'LOGREQUEST';

/* Other constants */
const HTTP_REQUEST = 'http-on-modify-request';
const HTTP_RESPONSE = 'http-on-examine-response';

/**
 * ZestRecorder class.
 * @param {pageworker} name
 *    Sidebar pageworker
 */
function ZestRecorder(worker) {
  this.Requests = [];
  this.PendingRequests = [];
  this.Observer = new ZestObserver(this);
  //this.reqCount = 0;
  //this.gReqCount = 0;
  this.sidebarWorker = worker;
  //this.gRequests = [];
  this.isLogged = false;

  // Observe when a tab change happens
  sdk_tabs.on('activate', this.tabChange.bind(this));

  // Sidebar -> ZestRecorder signal listeners
  this.sidebarWorker.port.on(SIG_LOCKTAB, () => {
    this.tab = this.activeTab();

    this.tab._monitor = !this.tab._monitor;
    if (this.tab._monitor) {
      console.log('Monitoring tab ON');
      try {
        let w = window.getMostRecentBrowserWindow();
        let tabBrowser = w.gBrowser.getBrowserForTab(this.tab);
        //tabBrowser.webProgress.addProgressListener(this.Observer, 0xFE);
      }
      catch(e) {}
    }
    else {
      console.log('Monitoring tab OFF');
      try {
        let w = window.getMostRecentBrowserWindow();
        let tabBrowser = w.gBrowser.getBrowserForTab(this.tab);
        //tabBrowser.webProgress.removeProgressListener(this.Observer);
      }
      catch(e) {}
    }

    // Update the monitor signal
    this.sidebarWorker.port.emit(SIG_MONITOR_SIGNAL, this.tab._monitor);
  });

  // Retrieve the zest json and display in sidebar
  this.sidebarWorker.port.on(SIG_GET_JSON, (id) => {
    // Get the required request 
    let b = ZestLog.getLogById(id);
    // Get the zest string of the request
    let zestString = b.zest;

    this.sidebarWorker.port.emit(SIG_RCV_JSON, b);
  });

  this.sidebarWorker.port.on('TREE_CHANGED', (tree) => {
    let b = ZestLog.getLogById(tree.id);

    let z = JSON.parse(b.zest);
    let stmts = z.statements;

    for (let stmt of stmts) {
      if (stmt.index == tree.src) {
        stmt.index = parseInt(tree.dst) + 1;
        stmts.splice(tree.src - 1, 1); // remove the source element
        // To avoid messing up arrangement due to deletion of above array element
        if (tree.src < tree.dst) {
          stmts.splice(tree.dst-1, 0, stmt);
        }
        else {
          stmts.splice(tree.dst, 0, stmt); // add the source element
        }
        break;
      }
    }

    // rename the index of statements
    if (tree.src > tree.dst) {
      for (let j = (tree.dst + 1); j < tree.src; j++) {
        stmts[j].index = j + 1;
      }
    }
    else {
      for (let j = (tree.src - 1); j < tree.dst; j++) {
        stmts[j].index = j + 1;
      }
    }

    z.statements = stmts;
    z = JSON.stringify(z, undefined, 2);

    ZestLog.addToId(tree.id, z);
    this.sidebarWorker.port.emit('UPDATE_TEXT_VIEW', z); // update zest text
  });

  this.sidebarWorker.port.on('RUN_NODE', (node) => {
    let target = node.nodeKey - 1;

    let b = ZestLog.getLogById(node.treeId);
    let z = JSON.parse(b.zest);
    let stmt = z.statements[target];
    stmt = JSON.stringify(stmt);

    ZestRunner.run(stmt, 'req', this.sidebarWorker);

  });

  this.sidebarWorker.port.on('CHANGE_ATTR', (node) => {
    let target = node.nodeKey - 1;
    let b = ZestLog.getLogById(node.treeId);
    let z = JSON.parse(b.zest);
    let stmts = z.statements;
    if (node.changes.type == 'ZestRequest') {
      let changes = node.changes.attr;
      stmts[target].url = changes['request.url'];
      stmts[target].method = changes['request.method'];
      stmts[target].data = changes['request.body'];
      stmts[target].headers = changes['request.header'];
      stmts[target].response.statusCode = changes['response.statusCode'];
      stmts[target].response.responseTimeInMs = changes['response.time'];
      stmts[target].response.headers = changes['response.header'];
      stmts[target].response.body = changes['response.body'];
    }
    else if (node.changes.type == 'ZestComment') {
      stmts[target].comment = node.changes.attr;
    }
    else {
      let s = stmts[target].assertions[node.id];

      switch (node.changes.type) {
        case 'ZestExpressionStatusCode':
          s.rootExpression.code = node.changes.code;
          break;

        case 'ZestExpressionLength':
          s.rootExpression.variableName = node.changes.variableName;
          s.rootExpression.length = node.changes.length;
          s.rootExpression.approx = node.changes.approx;
          break;

        case 'ZestExpressionRegex':
          s.rootExpression.variableName = node.changes.variableName;
          s.rootExpression.regex = node.changes.regex;
          s.rootExpression.caseExact = node.changes.caseSense;
          s.rootExpression.not = node.changes.inverse;
          break;
      }

      stmts[target].assertions[node.id] = s;
    }

    z.statements = stmts;
    z = JSON.stringify(z, undefined, 2);

    ZestLog.addToId(node.treeId, z);
    this.sidebarWorker.port.emit('UPDATE_TEXT_VIEW', z);
  });

  // Delete a Request element
  this.sidebarWorker.port.on('DELETE_NODE', (node) => {
    let target = node.nodeKey - 1;
    let start;

    let b = ZestLog.getLogById(node.treeId);
    let z = JSON.parse(b.zest);
    let stmts = z.statements;
    if (target == 0) {
      start = 0;
      stmts.shift();
    } else {
      //start = target - 1;
      stmts.splice(target, 1);
      start = target - 1;
    }

    let i = start;
    while (stmts[i]) {
      stmts[i].index = i + 1;
      i++;
    }

    z.statements = stmts;
    z = JSON.stringify(z, undefined, 2);

    ZestLog.addToId(node.treeId, z);
    this.sidebarWorker.port.emit('UPDATE_TEXT_VIEW', z);
  });

  this.sidebarWorker.port.on('DELETE_ASSERTION', (node) => {
    let target = node.nodeKey - 1;
    let b = ZestLog.getLogById(node.treeId);
    let z = JSON.parse(b.zest);
    let stmts = z.statements;
    let s = stmts[target].assertions;
    s.splice(node.id, 1);
    stmts[target].assertions = s;

    z.statements = stmts;
    z = JSON.stringify(z, undefined, 2);

    ZestLog.addToId(node.treeId, z);
    this.sidebarWorker.port.emit('UPDATE_TEXT_VIEW', z);
  });

  // Handle newly added child elements to parent request node.
  this.sidebarWorker.port.on('ADD_ELEMENT', (node) => {
    let target = node.nodeKey - 1;

    let b = ZestLog.getLogById(node.treeId);
    let z = JSON.parse(b.zest);
    let stmts = z.statements;
    let ele;

    switch (node.element.type) {
      case 'ZestExpressionRegex':
        ele = {
          rootExpression: {
            regex: node.element.regex,
            variableName: node.element.varName,
            caseExact: node.element.caseExact,
            not: node.element.not,
            elementType: node.element.type
          },
          elementType: 'ZestAssertion'
        }
        break;

      case 'ZestExpressionLength':
        ele = {
          rootExpression: {
            length: node.element.length,
            approx: node.element.approx,
            variableName: node.element.varName,
            not: false,
            elementType: node.element.type
          },
          elementType: 'ZestAssertion'
        }
        break;

      case 'ZestExpressionRegex':
        ele = {
          rootExpression: {
            regex: node.element.regex,
            variableName: node.element.variableName,
            caseExact: node.element.caseSense,
            not: node.element.inverse,
            elementType: node.element.type
          },
          elementType: 'ZestAssertion'
        }
        break;

      default:
    }

    stmts[target].assertions.push(ele);

    z.statements = stmts;
    z = JSON.stringify(z, undefined, 2);

    ZestLog.addToId(node.treeId, z);
    this.sidebarWorker.port.emit('UPDATE_TEXT_VIEW', z);
  });

  // Add a parent node, like a comment, to the tree.
  this.sidebarWorker.port.on('ADD_PARENT_ELEMENT', (node) => {
    let b = ZestLog.getLogById(node.treeId);
    let z = JSON.parse(b.zest);
    let stmts = z.statements;
    stmts.splice(node.precedingNodeKey, 0, node.element);

    let i = node.precedingNodeKey;
    while (stmts[i]) {
      stmts[i].index = i + 1;
      i++;
    }

    JSON.stringify(stmts);
    z.statements = stmts;
    z = JSON.stringify(z, undefined, 2);

    ZestLog.addToId(node.treeId, z);
    this.sidebarWorker.port.emit('UPDATE_TEXT_VIEW', z);
  });

  // Clear everything recorded by the recorder
  this.sidebarWorker.port.on(SIG_CLEAR_LOGS, () => {
    this.clearRequests();
    this.cleargRequests();
  });

  this.sidebarWorker.port.on(SIG_WITH_RESPONSE_BODY, (withRespBody) => {
    this.withRespBody = withRespBody;
  });
}

ZestRecorder.prototype = {
  Observer: null,
  Requests: null,
  PendingRequests: null,
  IsWatching: false,
  sidebarWorker: null,
  tab: null,
  withRespBody: false,
  id: null,

  startWatching: function() {
    console.log('ZestRecorder started');
    this.sidebarWorker.port.emit('CLEAR_CARDS');
    this.Observer.start();
    this.IsWatching = true;
  },

  stopWatching: function() {
    console.log('ZestRecorder stopped');
    this.Observer.stop();
    this.IsWatching = false;
  },

  // XXX Might have to remove
  getGroupRequestById: function(id) {
    for (let i of this.gRequests) {
      if (i.id == id) {
      return i;
      }
    }
  },

  // Send record to sidebar
  logToSidebar: function(name, id) {
    try {
      this.sidebarWorker.port.emit(SIG_LOG_REQUEST, { url: name, id: id });
    }
    catch (e) {}
  },

  // Clear all the records
  clearRequests: function() {
    this.Requests = [];
    this.PendingRequests = [];
  },

  cleargRequests: function() {
    //this.gRequests = [];
    ZestLog.clearAll();
  },

  isNewRequest: function(request) {
    return (this.getPendingRequestForRequestEvent(request) == -1) ? true : false;
  },

  getPendingRequestForRequestEvent: function(request) {
    for (let i = 0; i < this.Requests.length; i++) {
      if (request.HttpChannel === this.Requests[i].HttpChannel) {
        return i;
      }
    }

    return -1;
  },

  activeTab: function() {
    return tabs_tabs.getActiveTab(window.getMostRecentBrowserWindow());
  },

  tabChange: function() {
    this.tab = this.activeTab();
    this.sidebarWorker.port.emit(SIG_MONITOR_SIGNAL, this.tab._monitor);
  }

};


// WebProgressListener states
/*
let wplFlag = {
  STATE_START: Ci.nsIWebProgressListener.STATE_START,
  STATE_STOP: Ci.nsIWebProgressListener.STATE_STOP,
  STATE_REDIRECTING: Ci.nsIWebProgressListener.STATE_REDIRECTING
}
*/


/**
 * ZestObserver class to observe the req/res events.
 * @param {Object} ZestReference
 *    A reference of the ZestRecorder.
 */
function ZestObserver(ZestReference) {
  this.ZestRecorder = ZestReference;
}

ZestObserver.prototype = {
  start: function() {
    this.addListener();
  },

  stop: function() {
    try {
      let gr = new GroupedRequests(this.ZestRecorder, this.ZestRecorder.Requests);
      if (ZestLog.addToId(this.ZestRecorder.id, gr.getZest())) {
        console.log('Zest updated!');
      }
      else {
        console.log('Zest update FAILED');
      }
      this.ZestRecorder.Requests = [];
      this.ZestRecorder.isLogged = false; // reset the logging status
    }
    catch(e) {}
    this.removeListener();
  },

  addListener: function() {
    observerService.addObserver(this, HTTP_REQUEST, false);
    observerService.addObserver(this, HTTP_RESPONSE, false);
  },

  removeListener: function() {
    observerService.removeObserver(this, HTTP_REQUEST);
    observerService.removeObserver(this, HTTP_RESPONSE);
  },

  observe: function(subject, topic, data) {
    subject.QueryInterface(Ci.nsIHttpChannel);

    if (topic == HTTP_REQUEST) {
      this.onModifyRequest(subject);
    }
    else if (topic == HTTP_RESPONSE) {
      this.onExamineResponse(subject);
    }
  },

  onModifyRequest: function(HttpChannel) {
    let tab = this.getTabFromChannel(HttpChannel);

    // Record only tabs which are locked for monitoring
    if (tab && tab._monitor) {

      let request = new ZestRequest(this.ZestRecorder, HttpChannel,
                                    HTTP_REQUEST);
      this.ZestRecorder.Requests.push(request);
      this.ZestRecorder.PendingRequests.push(request);

      // log to sidebar only when it's the first request of a recording session
      if (!this.ZestRecorder.isLogged) {
        this.ZestRecorder.id = ZestLog.add('');
        let time = new Date();
        let name = 'Zest-' + time.getHours().toString() + ':' +
                   time.getMinutes().toString() + ':' +
                   time.getSeconds().toString();
        this.ZestRecorder.logToSidebar(name, this.ZestRecorder.id);
        this.ZestRecorder.isLogged = true;
      }
    }
  },

  onExamineResponse: function(HttpChannel) {

    let response = new ZestResponse(this.ZestRecorder, HttpChannel,
                                    HTTP_RESPONSE);

    console.log('pending count: ' + this.ZestRecorder.PendingRequests.length);
    for (let i = 0; i < this.ZestRecorder.PendingRequests.length; i++) {
      console.log('comparing: ' + response.url + ' & ' + this.ZestRecorder.PendingRequests[i].url);
      if (response.HttpChannel === this.ZestRecorder.PendingRequests[i].HttpChannel) {
        console.log('this matches, splicing!!');
        // set response time
        response.setResponseTime(this.ZestRecorder.PendingRequests[i].timestamp);

        this.ZestRecorder.PendingRequests[i].Response = response;
        this.ZestRecorder.PendingRequests.splice(i, 1);
      }
    }
  },

  getTabFromChannel: function(channel) {
    let wnd = this.getRequestWindow(channel);
    return (wnd && wnd.top == wnd) ? tabs_tabs.getTabForContentWindow(wnd) : null;
  },

  getRequestWindow: function(request) {
    try {
      if (request.notificationCallbacks)
        return request.notificationCallbacks.getInterface(Ci.nsILoadContext).
               associatedWindow;
    }
    catch(e) {}

    try {
      if (request.loadGroup && request.loadGroup.notificationCallbacks)
        return request.loadGroup.notificationCallbacks.
               getInterface(Ci.nsILoadContext).associatedWindow;
    }
    catch(e) {}
    return null;
  },

  /*
  onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) {

    if (aFlag & wplFlag.STATE_START) {
      console.log('STATE_START');
    }

  },
  */

  QueryInterface: XPCOMUtils.generateQI(['nsIWebProgressListener', 'nsISupportsWeakReference'])
}


/**
 * ZestRequest class to create request objects.
 * @param {Object} ZestReference
 *    A reference of the ZestRecorder.
 * @param {Object} HttpChannelReference
 *    A reference of the HttpChannel.
 * @param {String} EventSourceType
 *    Type of the event.
 */
function ZestRequest(ZestReference, HttpChannelReference, EventSourceType) {
  try {
    this.HttpChannel = HttpChannelReference.QueryInterface(Ci.nsIHttpChannel);
  }
  catch(ex) {
    return;
  }

  this.ZestRecorder = ZestReference;
  this.EventSource = EventSourceType;
  //this.id = this.ZestRecorder.count++;
  this.timestamp = new Date().getTime();

  this.init();
}

ZestRequest.prototype = {
  id: null,
  Zest: null,
  HttpChannel: null,
  RequestHeaders: '',
  Response: '',
  method: null,
  url: '',
  data: '',
  timestamp: '',

  init: function() {
    let dummyHeaderInfo;

    this.url = this.HttpChannel.originalURI.scheme + '://' +
               this.HttpChannel.originalURI.host +
               this.HttpChannel.originalURI.path;
    this.method = this.HttpChannel.requestMethod;

    if (this.EventSource == HTTP_REQUEST) {
      // Get request headers
      dummyHeaderInfo = new HeaderInfo();
      this.HttpChannel.visitRequestHeaders(dummyHeaderInfo);
      this.RequestHeaders = dummyHeaderInfo.Headers;

      this.getPostData();
    }
  },

  // Get the zest json in stringified form
  getZest: function() {
    this.Zest = new ZestObject(this);
    return this.Zest.getString();
  },

  getTime: function() {
    return this.timestamp;
  },

  getBody: function() {
    return this.Response.bodyListener.responseBody;
  },

  getResponseHeader: function() {
    return this.Response.ResponseHeaders;
  },

  getRequestHeaders: function() {
    return this.RequestHeaders;
  },

  getPostData: function() {
    try {
      let postChannel = this.HttpChannel.QueryInterface(Ci.nsIUploadChannel);

      if (postChannel.uploadStream) {
        this.PostDataChannel = postChannel;
        let postDataHandler = new PostDataHandler(this);
        postDataHandler.getPostData();
      }
    }
    catch (ex) {}
  }
};


/**
 * PostDataHandler class to extract the post data from a request.
 * @param {Object} hfRequest
 *    The request object with httpchannel.
 */
function PostDataHandler(hfRequest) {
  this.request = hfRequest;
  this.request.IsPostDataMIME = false;
  this.seekablestream = this.request.HttpChannel.uploadStream.
                        QueryInterface(Ci.nsISeekableStream);
  this.stream = Cc['@mozilla.org/scriptableinputstream;1'].
                createInstance(Ci.nsIScriptableInputStream);
  this.stream.init(this.seekablestream);

  this.hasheaders = false;
  this.body = 0;
  this.isBinary = true;

  if (this.seekablestream instanceof Ci.nsIMIMEInputStream) {
    this.seekablestream.QueryInterface(Ci.nsIMIMEInputStream);
    this.hasheaders = true;
    this.body = -1;
    this.isBinary = false;
  }
  else if (this.seekablestream instanceof Ci.nsIStringInputStream) {
    this.seekablestream.QueryInterface(Ci.nsIStringInputStream);
    this.hasheaders = false;
    this.body = -1;
  }
}

PostDataHandler.prototype = {
  rewind: function() {
    this.seekablestream.seek(0, 0);
  },

  tell: function() {
    return this.seekablestream.tell();
  },

  readLine: function() {
    let line = '';
    let size = this.stream.available();
    for (let i = 0; i < size; i++) {
      let c = this.stream.read(1);
      if (c == '\r') {}
      else if (c == '\n') {
        break;
      }
      else {
        line += c;
      }
    }
    return line;
  },

  getPostHeaders: function() {
    if (this.hasheaders) {
      this.rewind();
      let line = this.readLine();
      while(line) {
        if (this.request) {
          let tmp = line.split(/:\s?/);
          this.addPostHeader(tmp[0], tmp[1]);
          // check if MIME postdata
          if (tmp[0].toLowerCase() == 'content-type' &&
              tmp[1].indexOf('multipart') != '-1') {
            this.isBinary = true;
            this.request.IsPostDataMIME = true;
            this.request.PostDataMIMEBoundary = '--' + tmp[1].split('boundary=')[1];
            if (this.request.PostDataMIMEBoundary.indexOf('\"') === 0) {
              this.request.PostDataMIMEBoundary = this.request.PostDataMIMEBoundary.substr(1, this.request.PostDataMIMEBoundary.length - 2);
            }
          }
        }
        line = this.readLine();
      }
      this.body = this.tell();
    }
  },

  addPostHeader: function(name, value) {
    if (!this.request.PostDataHeaders) {
      this.request.PostDataHeaders = [];
    }
    this.request.PostDataHeaders[name] = value;
  },

  clearPostHeaders: function() {
    if (this.request.PostDataHeaders) {
      delete this.request.PostDataHeaders;
    }
  },

  getPostData: function() {

    // Position the stream to the start of the body
    if (this.body < 0 || this.seekablestream.tell() != this.body) {
      this.getPostHeaders();
    }

    let size = this.stream.available();
    if (size === 0 && this.body !== 0) {
      this.rewind();
      this.clearPostHeaders();
      size = this.stream.available();
    }

    // read post body (only if non-binary/too big)
    let postString = '';

    try {
      if (size < 500000) {
        // This is to avoid 'NS_BASE_STREAM_CLOSED' exception
        for (let u = 0; u < size; u++) {
          let c = this.stream.read(1);
          if (c) {
            postString += c;
          }
          else {
            postString += '\0';
          }
        }
      }
      else {
        this.request.IsPostDataTooBig = true;
      }
    }
    catch (e) {}
    finally {
      this.rewind();
    }

    this.request.data = postString;
  }
};

/**
 * ZestResponse class to create response objects.
 * @param {Object} ZestReference
 *    A reference of the ZestRecorder.
 * @param {Object} HttpChannelReference
 *    A reference of the HttpChannel.
 * @param {String} EventSourceType
 *    Type of the event.
 */
function ZestResponse(ZestReference, HttpChannelReference, EventSourceType) {
  try {
    this.HttpChannel = HttpChannelReference.QueryInterface(Ci.nsIHttpChannel);
  }
  catch(ex) {
    return;
  }

  this.ZestRecorder = ZestReference;
  this.EventSource = EventSourceType;
  this.timestamp = new Date().getTime();

  this.init();
}

ZestResponse.prototype = {
  ZestRecorder: null,
  HttpChannel: null,
  RequestHeaders: null,
  ResponseHeaders: null,
  bodyListener: null,
  method: null,
  url: null,
  statusCode: null,
  statusText: null,
  length: null,
  RequestProtocolVersion: null,
  ResponseProtocolVersion: null,
  responseTimeInMs: null,

  init: function() {
    let dummyHeaderInfo;
    this.statusCode = this.HttpChannel.responseStatus;
    this.statusText = this.HttpChannel.responseStatusText;
    // XXX length is -1 when it's value is huge. Need to be fixed.
    // refer: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIChannel
    this.length = this.HttpChannel.contentLength;
    this.method = this.HttpChannel.requestMethod;
    this.url = this.HttpChannel.originalURI.scheme + '://' +
               this.HttpChannel.originalURI.host +
               this.HttpChannel.originalURI.path;

    // Get the protocol versions
    this.getRequestProtocolVersion();
    this.getResponseProtocolVersion();

    // Get request headers
    dummyHeaderInfo = new HeaderInfo();
    this.HttpChannel.visitRequestHeaders(dummyHeaderInfo);
    this.RequestHeaders = this.properRequestHeaders(dummyHeaderInfo.Headers);

    // get response headers
    dummyHeaderInfo = new HeaderInfo();
    this.HttpChannel.visitResponseHeaders(dummyHeaderInfo);
    this.ResponseHeaders = this.properResponseHeaders(dummyHeaderInfo.Headers);

    this.bodyListener = new TracingListener();
    this.HttpChannel.QueryInterface(Ci.nsITraceableChannel);
    this.bodyListener.originalListener = this.HttpChannel.setNewListener(this.bodyListener);
  },

  properRequestHeaders: function(headers) {
    let finalHeaders = 'HTTP/' + this.RequestProtocolVersion + ' ' +
                      this.statusCode + ' ' + this.statusText + '\r\n' +
                      headers;
    return finalHeaders;
  },

  properResponseHeaders: function(headers) {
    let finalHeaders = 'HTTP/' + this.ResponseProtocolVersion + ' ' +
                      this.statusCode + ' ' + this.statusText + '\r\n' +
                      headers;
    return finalHeaders;
  },

  getRequestProtocolVersion: function() {
    try {
      let httpChannelInternal = this.HttpChannel.QueryInterface(Ci.nsIHttpChannelInternal);
      let ver1 = {};
      let ver2 = {};
      httpChannelInternal.getRequestVersion(ver1, ver2);
      this.RequestProtocolVersion = ver1.value + '.' + ver2.value;
    }
    catch(ex) {
    
    }
  },

  getResponseProtocolVersion: function() {
    try {
      let httpChannelInternal = this.HttpChannel.QueryInterface(Ci.nsIHttpChannelInternal);
      let ver1 = {};
      let ver2 = {};
      httpChannelInternal.getResponseVersion(ver1, ver2);
      this.ResponseProtocolVersion = ver1.value + '.' + ver2.value;
    }
    catch(ex) {
    
    }
  },

  setResponseTime: function(reqTime) {
    this.responseTimeInMs = this.timestamp - reqTime;
  }
}


/**
 * HeaderInfo class to collect and store header info.
 */
function HeaderInfo() {
  this.init();
}

HeaderInfo.prototype = {
  Headers: '',

  init: function() {
    this.Headers = [];
  },

  visitHeader: function(name, value) {
    this.Headers += name + ': ' + value + '\r\n';
  }
};


/**
 * TracingListener class to create listeners for the events in channels.
 */
function TracingListener() {
  this.originalListener = null;
  this.receivedData = [];
  this.responseBody = null;
}

TracingListener.prototype = {
  onDataAvailable: function(request, context, inputStream, offset, count) {
    try {
      let binaryInputStream = Cc['@mozilla.org/binaryinputstream;1'].
                              createInstance(Ci.nsIBinaryInputStream);
      let storageStream = Cc['@mozilla.org/storagestream;1'].
                          createInstance(Ci.nsIStorageStream);
      let binaryOutputStream = Cc['@mozilla.org/binaryoutputstream;1'].
                               createInstance(Ci.nsIBinaryOutputStream);

      binaryInputStream.setInputStream(inputStream);
      storageStream.init(8192, count, null);

      binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

      let data = binaryInputStream.readBytes(count);
      this.receivedData.push(data);

      binaryOutputStream.writeBytes(data, count);

      this.originalListener.onDataAvailable(request, context,
                                            storageStream.newInputStream(0),
                                            offset, count);
    }
    catch (e) {}
  },

  onStartRequest: function(request, context) {
    this.receivedData = [];
    this.responseBody = null;
    this.originalListener.onStartRequest(request, context);
  },

  onStopRequest: function(request, context, statusCode) {
    this.responseBody = this.receivedData.join();
    this.originalListener.onStopRequest(request, context, statusCode);
  },

  QueryInterface: function(aIID) {
    if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupport)) {
      return this;
    }

    throw Cr.NS_NOINTERFACE;
  }
};


function GroupedRequests(zestReference, requests) {
  this.ZestRecorder = zestReference;
  this.requests = requests;
  this.name = requests[0].url;
}

GroupedRequests.prototype = {
  id: null,
  name: null,
  requests: [],
  zest: null,

  getZest: function() {
    this.zest = new ZestObject(this.requests, this.ZestRecorder.withRespBody);
    return this.zest.getString();
  }
}

exports.ZestRecorder = ZestRecorder;
