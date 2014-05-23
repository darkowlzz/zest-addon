const { Cc, Ci, Cr } = require('chrome');

let observerService = Cc['@mozilla.org/observer-service;1'].
                      getService(Ci.nsIObserverService);


function ZestRecorder() {
  this.Requests = [];
  this.PendingRequests = [];
  this.Observer = new ZestObserver(this);
}

ZestRecorder.prototype = {
  Observer: null,
  Requests: null,
  PendingRequests: null,
  IsWatching: false,

  startWatching: function() {
    if (!this.IsWatching) {
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
    console.log('found a request');

    let request = new ZestRequest(this.ZestRecorder, HttpChannel,
                                  'http-on-modify-request');
    this.ZestRecorder.Requests.push(request);
    this.ZestRecorder.PendingRequests.push(request);
  },

  onExamineResponse: function(HttpChannel) {
    console.log('found a response');

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

  this.init();
}

ZestRequest.prototype = {
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
    console.log('initiating response');
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
    console.log('created new listener');
    this.HttpChannel.QueryInterface(Ci.nsITraceableChannel);
    //this.HttpChannel.asyncOpen(newListener, null);
    this.bodyListener.originalListener = this.HttpChannel.setNewListener(this.bodyListener);
    //this.ResponseBody = newListener.responseBody;
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
    console.log('data avaiable');
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
    //console.log(this.responseBody);
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
