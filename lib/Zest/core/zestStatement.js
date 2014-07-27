'use strict';

/**
 * Refer:
 * https://github.com/mozilla/zest/blob/master/src/org/mozilla/zest/core/v1/ZestStatement.java
 */

function ZestStatement (index) {
  this.index = index;
}

ZestStatement.prototype = {
  index: null,
  previous: null,
  next: null,

  getPrevious: function() {
    return this.previous;
  },

  setPrev: function(prev) {
    this.previous = prev;
  },

  insertBefore: function(stmt) {
    let nxt = stmt.getNext();
    this.next = nxt;
    if (nxt !== null) {
      nxt.previous = this;
    }
    this.previous = stmt;
    stmt.setNext(this);
    this.setIndex(stmt.getIndex()+1, true);
  },

  insertAfter: function(stmt) {
    let prv = stmt.getPrevious();
    this.previous = prv;
    if (prv !== null) {
      prv.setNext(this);
    }
    this.setNext(stmt);
    stmt.previous = this;
    this.setIndex(stmt.getIndex(), true);
  },

  /*
  remove: function() {
  
  },
  */

  getNext: function() {
    return this.next;
  },

  setNext: function(next) {
    this.next = next;
  },

  getIndex: function() {
    return this.index;
  },

  // NOTE: this is a recursive method
  setIndex: function(index, recurse) {
    this.index = index;
    if (recurse && this.next !== null) {
      if (this == this.next) {
        console.log('IllegalArgumentException');
      }
      this.next.setIndex(index+1, true);
    }
  }
};

extends.ZestStatement = ZestStatement;
