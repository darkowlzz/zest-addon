const { Cc, Ci, Cr } = require('chrome');
let tabs_tabs = require('sdk/tabs/utils');
let sdk_tabs = require('sdk/tabs');
let window = require('sdk/window/utils');

let observerService = Cc['@mozilla.org/observer-service;1'].
                      getService(Ci.nsIObserverService);

/**
 * ZestRecorder class.
 * @param {pageworker} name
 *    Sidebar pageworker
 */
function ZestRecorder(worker) {
  this.Requests = [];
  this.PendingRequests = [];
  this.Observer = new ZestObserver(this);
  this.count = 0;
  this.sidebarWorker = worker;

  // Observe when a tab change happens
  sdk_tabs.on('activate', this.tabChange.bind(this));

  // Sidebar -> ZestRecorder signal listeners
  this.sidebarWorker.port.on('LOCKTAB', () => {
    this.tab = this.activeTab();

    this.tab._monitor = !this.tab._monitor;
    if (this.tab._monitor) {
      console.log('Monitoring tab ON');
    }
    else {
      console.log('Monitoring tab OFF');
    }

    // Update the monitor signal
    this.sidebarWorker.port.emit('MONITORSIG', this.tab._monitor);
  });

  this.sidebarWorker.port.on('SHOWJSON', (id) => {
    let b = this.getRequestById(id);
    this.sidebarWorker.port.emit('VIEWJSON', b.Response.bodyListener.responseBody);
  });

  this.sidebarWorker.port.on('CLEAR', () => {
    this.clearRequests();
  });

}

ZestRecorder.prototype = {
  Observer: null,
  Requests: null,
  PendingRequests: null,
  IsWatching: false,
  sidebarWorker: null,
  tab: null,

  startWatching: function(worker) {
    if (!this.IsWatching) {
      this.sidebarWorker = worker;
      console.log('ZestRecorder started');
      this.Observer.start();
      this.IsWatching = true;
    }
    else {
      console.log('Recorder is already running...');
    }
  },

  stopWatching: function() {
    if (this.IsWatching) {
      console.log('ZestRecorder stopped');
      this.Observer.stop();
      this.IsWatching = false;
    }
    else {
      console.log('Recorder OFF');
    }
  },

  getRequestById: function(id) {
    for (let i of this.Requests) {
      if (i.id == id) {
        return i;
      }
    }
  },

  // Send record to sidebar
  logToSidebar: function(request) {
    try {
      this.sidebarWorker.port.emit('LOGREQUEST', { url: request.url, id: request.id });
    }
    catch (e) {}
  },

  // Clear all the records
  clearRequests: function() {
    this.Requests = [];
    this.PendingRequests = [];
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
    this.sidebarWorker.port.emit('MONITORSIG', this.tab._monitor);
  }

};


function ZestObserver(ZestReference) {
  this.ZestRecorder = ZestReference;
}

ZestObserver.prototype = {
  start: function() {
    this.addListener();
  },

  stop: function() {
    this.removeListener();
  },

  addListener: function() {
    observerService.addObserver(this, 'http-on-modify-request', false);
    observerService.addObserver(this, 'http-on-examine-response', false);
  },

  removeListener: function() {
    observerService.removeObserver(this, 'http-on-modify-request');
    observerService.removeObserver(this, 'http-on-examine-response');
  },

  observe: function(subject, topic, data) {
    subject.QueryInterface(Ci.nsIHttpChannel);

    if (topic == 'http-on-modify-request') {
      this.onModifyRequest(subject);
    }
    else if (topic == 'http-on-examine-response') {
      this.onExamineResponse(subject);
    }
  },

  onModifyRequest: function(HttpChannel) {
    let tab = this.getTabFromChannel(HttpChannel);

    // Record only tabs which are locked for monitoring
    if (tab && tab._monitor) {

      let request = new ZestRequest(this.ZestRecorder, HttpChannel,
                                    'http-on-modify-request');
      this.ZestRecorder.Requests.push(request);
      this.ZestRecorder.PendingRequests.push(request);
      this.ZestRecorder.logToSidebar(request);
    }
  },

  onExamineResponse: function(HttpChannel) {

    let response = new ZestResponse(this.ZestRecorder, HttpChannel,
                                    'http-on-examine-response');

    console.log('pending count: ' + this.ZestRecorder.PendingRequests.length);
    for (let i = 0; i < this.ZestRecorder.PendingRequests.length; i++) {
      console.log('comparing: ' + response.url + ' & ' + this.ZestRecorder.PendingRequests[i].url);
      if (response.HttpChannel === this.ZestRecorder.PendingRequests[i].HttpChannel) {
        console.log('this matches, splicing!!');
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

  QueryInterface: function() {
    if (!iid.equals(Ci.nsISupports) &&
        !iid.equals(Ci.nsISupportsWeakReference) &&
        !iid.equals(Ci.nsIObserver) &&
        !iid.equals(Ci.nsIWebProgressListener) &&
        !iid.equals(Ci.nsIURIContentListener) &&
        !iid.equals(Ci.nsIStreamListener) &&
        !iid.equals(Ci.nsIRequestObserver) &&
        !iid.equals(Ci.nsISupportsString)) {
      throw Cr.NS_ERROR_NO_INTERFACE;
    }

    return this;
  }
}


function ZestRequest(ZestReference, HttpChannelReference, EventSourceType) {
  try {
    this.HttpChannel = HttpChannelReference.QueryInterface(Ci.nsIHttpChannel);
  }
  catch(ex) {
    return;
  }

  this.ZestRecorder = ZestReference;
  this.EventSource = EventSourceType;
  this.id = this.ZestRecorder.count++;

  this.init();
}

ZestRequest.prototype = {
  id: null,
  Zest: null,
  HttpChannel: null,
  RequestHeaders: null,
  Response: null,
  method: null,
  url: null,

  init: function() {
    let dummyHeaderInfo;

    this.url = this.HttpChannel.originalURI.scheme + '://' +
               this.HttpChannel.originalURI.host +
               this.HttpChannel.originalURI.path;
    this.method = this.HttpChannel.requestMethod;

    if (this.EventSource == 'http-on-modify-request') {
      // Get request headers
      dummyHeaderInfo = new HeaderInfo();
      this.HttpChannel.visitRequestHeaders(dummyHeaderInfo);
      this.RequestHeaders = dummyHeaderInfo.Headers;
    }
  },

  getBody: function() {
    return this.Response.bodyListener.responseBody;
  },

  getResponseHeader: function() {
    return this.Response.ResponseHeaders;
  },

  getRequestHeaders: function() {
    return this.RequestHeaders;
  }
};

function ZestResponse(ZestReference, HttpChannelReference, EventSourceType) {
  try {
    this.HttpChannel = HttpChannelReference.QueryInterface(Ci.nsIHttpChannel);
  }
  catch(ex) {
    return;
  }

  this.ZestRecorder = ZestReference;
  this.EventSource = EventSourceType;

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

  init: function() {
    let dummyHeaderInfo;
    this.statusCode = this.HttpChannel.responseStatus;
    this.statusText = this.HttpChannel.responseStatusText;
    this.method = this.HttpChannel.requestMethod;
    this.url = this.HttpChannel.originalURI.scheme + '://' +
               this.HttpChannel.originalURI.host +
               this.HttpChannel.originalURI.path;

    // Get request headers
    dummyHeaderInfo = new HeaderInfo();
    this.HttpChannel.visitRequestHeaders(dummyHeaderInfo);
    this.RequestHeaders = dummyHeaderInfo.Headers;

    // get response headers
    dummyHeaderInfo = new HeaderInfo();
    this.HttpChannel.visitResponseHeaders(dummyHeaderInfo);
    this.ResponseHeaders = dummyHeaderInfo.Headers;

    this.bodyListener = new TracingListener();
    this.HttpChannel.QueryInterface(Ci.nsITraceableChannel);
    this.bodyListener.originalListener = this.HttpChannel.setNewListener(this.bodyListener);
  }
}


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

exports.ZestRecorder = ZestRecorder;
