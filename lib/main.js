const events = require('sdk/system/events');
const { Ci, Cc, Cr } = require('chrome');
const { defer } = require('sdk/core/promise');

let observerService = Cc['@mozilla.org/observer-service;1'].
                      getService(Ci.nsIObserverService);

let responseHTML = null;

// This would store all the zest objects in memory.
let zestObjects = [];

// Tracing Listener
// To listen to the response body
function TracingListener() {
  this.originalListener = null;
  this.receivedData = [];
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
    this.originalListener.onStartRequest(request, context);
  },

  onStopRequest: function(request, context, statusCode) {
    let responseSource = this.receivedData.join();
    responseHTML = responseSource;
    this.originalListener.onStopRequest(request, context, statusCode);
  },

  QueryInterface: function(aIID) {
    if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupport)) {
      return this;
    }

    throw Cr.NS_NOINTERFACE;
  }
}

// Handle asynchronous response
function respAsync(channel) {
  let deferred = defer();
  let head = '';

  const visitor = {
    visitHeader: (aHeader, aValue) => {
      head += aHeader + ': ' + aValue + '\r\n';
    }
  }

  let httpResponseObserver = {
    observe: function(aSubject, aTopic, aData) {
      let res = {};
      if (aTopic == 'http-on-examine-response') {
        try {
        channel.visitResponseHeaders(visitor);
        head = 'HTTP/1.1 ' + channel.responseStatus + ' ' +
               channel.responseStatusText + '\r\n' + head;

        let newListener = new TracingListener();
        aSubject.QueryInterface(Ci.nsITraceableChannel);
        newListener.originalListener = aSubject.setNewListener(newListener);
        //console.log('response HTML: ' + responseHTML);
        res['url'] = channel.originalURI.scheme + '://' +
                     channel.originalURI.host + channel.originalURI.path;
        res['headers'] = head;
        res['body'] = responseHTML;
        res['statusCode'] = channel.responseStatus;
        res['elementType'] = 'ZestResponse';
        }
        catch (e) {}
        deferred.resolve(res);
      }
    },

    QueryInterface: function(aIID) {
      if (aIID.equals(Ci.nsIObserver) || aIID.equals(Ci.nsISupports)) {
        return this;
      }

      throw Cr.NS_NOINTERFACE;
    }
  }

  // Using sdk/events. Need to make it work.
  /*
  let httpResponseObserver = function(event) {
    console.log('chk checking...');
    channel.visitResponseHeaders(visitor);
    head = 'HTTP/1.1 ' + channel.responseStatus + ' ' +
           channel.responseStatusText + '\r\n' + head;
    console.log(head);
    let newListener = new TracingListener();
    event.subject.QueryInterface(Ci.nsITraceableChannel);
    newListener.originalListener = event.subject.setNewListener(newListener);
    deferred.resolve('done');
  }
  */

  //events.on('http-on-examine-response', chk);
  observerService.addObserver(httpResponseObserver, 'http-on-examine-response',
                              false);

  return deferred.promise;
}

function listener(event) {
  let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);

  // Create a new req object
  let req = {}
  req.url = channel.originalURI.scheme + '://' + channel.originalURI.host +
               channel.originalURI.path;
  req.data = ''; // pending
  req.method = channel.requestMethod;
  req.header = ''; // pending

  // Push the req object in the zestObjects array.
  console.log('we have ' + JSON.stringify(req));
  zestObjects.push(req);

  respAsync(channel).then(function success(val) {
    // Parse throught the zest objects to find a req with matching url and
    // unmet response
    console.log('number of zestobj: ' + zestObjects.length);
    for (let r of zestObjects) {
      console.log('comparing: ' + r.url + ' and ' + val.url);
      if (r.url === val.url && r.response === void(0)) {
        console.log('THEY MATCH!!');
        r.response = val;
        break;
      }
    }
  }, function failure(reason) {
    console.log('Failed: ' + reason);
  });
}

events.on('http-on-modify-request', listener);
