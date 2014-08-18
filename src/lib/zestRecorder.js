/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/* Library imports */
const { Cc, Ci, Cr, Cu } = require('chrome');
let tabs_tabs = require('sdk/tabs/utils');
let sdk_tabs = require('sdk/tabs');
let window = require('sdk/window/utils');
let { ZestObject } = require('zestObject');
let ZestLog = require('zestLog');
const { beautify } = require('zestHelper');

let observerService = Cc['@mozilla.org/observer-service;1'].
                      getService(Ci.nsIObserverService);

Cu.import('resource://gre/modules/XPCOMUtils.jsm');

/* Receive signal constants */
const SIG_LOCKTAB = 'LOCKTAB';
const SIG_CLEAR_LOGS = 'CLEAR';
const SIG_WITH_RESPONSE_BODY = 'WITHRESPBODY';

/* Emit signal constants */
const SIG_MONITOR_SIGNAL = 'MONITORSIG';
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
  this.sidebarWorker = worker;
  this.isLogged = false;

  // Observe when a tab change happens
  sdk_tabs.on('activate', this.tabChange.bind(this));

  // Sidebar -> ZestRecorder signal listeners
  this.sidebarWorker.port.on(SIG_LOCKTAB, () => {
    this.tab = this.activeTab();
    this.tab._monitor = !this.tab._monitor;
    if (this.tab._monitor) {
      console.log('Monitoring tab ON');
    }
    else {
      console.log('Monitoring tab OFF');
    }
    // Update the monitor signal
    this.sidebarWorker.port.emit(SIG_MONITOR_SIGNAL, this.tab._monitor);
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
      this.sidebarWorker.port.emit(SIG_LOG_REQUEST, { title: name, id: id });
    }
    catch (e) {}
  },

  // Clear all the records
  clearRequests: function() {
    this.Requests = [];
    this.PendingRequests = [];
  },

  cleargRequests: function() {
    ZestLog.clearAll();
  },

  isNewRequest: function(request) {
    return (this.getPendingReqForReqEvent(request) == -1) ? true : false;
  },

  getPendingReqForReqEvent: function(request) {
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
      let gr = new GroupedRequests(this.ZestRecorder,
                                   this.ZestRecorder.Requests);
      if (ZestLog.addToId(this.ZestRecorder.id, gr.getZest())) {
        console.log('Zest updated!');
      }
      else {
        console.log('Zest update FAILED');
      }
      this.ZestRecorder.Requests = [];
      this.ZestRecorder.isLogged = false; // reset the logging status
    }
    catch(e) {
      console.log('ErRoR is ' + e);
    }
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

  observe: function(subject, topic, data) { // jshint ignore:line
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
        this.ZestRecorder.id = ZestLog.add({}); // create an empty instance
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
      console.log('comparing: ' + response.url + ' & ' +
                  this.ZestRecorder.PendingRequests[i].url);
      if (response.HttpChannel ===
          this.ZestRecorder.PendingRequests[i].HttpChannel) {
        console.log('this matches, splicing!!');
        // set response time
        response.setResponseTime(
                 this.ZestRecorder.PendingRequests[i].timestamp);

        this.ZestRecorder.PendingRequests[i].Response = response;
        this.ZestRecorder.PendingRequests.splice(i, 1);
      }
    }
  },

  getTabFromChannel: function(channel) {
    let wnd = this.getRequestWindow(channel);
    return (wnd && wnd.top == wnd) ?
            tabs_tabs.getTabForContentWindow(wnd) : null;
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

  QueryInterface: XPCOMUtils.generateQI(
    [
      'nsIWebProgressListener',
      'nsISupportsWeakReference'
    ]
  )
};


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
            this.request.PostDataMIMEBoundary = '--' +
                                                tmp[1].split('boundary=')[1];
            if (this.request.PostDataMIMEBoundary.indexOf('\"') === 0) {
              this.request.PostDataMIMEBoundary = 
                this.request.PostDataMIMEBoundary.substr(
                  1, this.request.PostDataMIMEBoundary.length - 2
                );
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
    // refer: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/
    //        XPCOM/Reference/Interface/nsIChannel 
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
    this.bodyListener.originalListener = 
      this.HttpChannel.setNewListener(this.bodyListener);
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
      let httpChannelInternal = 
        this.HttpChannel.QueryInterface(Ci.nsIHttpChannelInternal);
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
      let httpChannelInternal =
        this.HttpChannel.QueryInterface(Ci.nsIHttpChannelInternal);
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
};


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
    let cleanReqs = beautify(this.requests);
    let opts = {
      type: 'new',
      requests: cleanReqs,
      withRespBody: this.ZestRecorder.withRespBody
    };
    this.zest = new ZestObject(opts);
    return this.zest.getZestJSON();
  }
};

exports.ZestRecorder = ZestRecorder;
