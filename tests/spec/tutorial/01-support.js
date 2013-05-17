describe("IndexedDB", function() {
  var a,db,id;

  /*
  Why care about IndexedDB?
    Single-page applications are here to stay.
    Ever heard a client or boss ask, "Is it possible?"
    "Any application that can be written in JavaScript,
        will eventually be written in JavaScript." - Atwood's Law
    Web developers are do increasingly amazing things on the browser.
    Data ownership and privacy.
    We have an over-dependency on servers.
      We fetch much of the same data... over and over.
    Offline.
    Speed.
  */

  it("checks to see if browser supports IndexedDB", function() {
    window.indexedDB =
      window.indexedDB ||
      window.mozIndexedDB || // Firefox 16+
      window.webkitIndexedDB || // Chrome 16+
      window.msIndexedDB; // IE10+

    window.IDBTransaction =
      window.IDBTransaction ||
      window.webkitIDBTransaction ||
      window.msIDBTransaction;

    window.IDBKeyRange =
      window.IDBKeyRange ||
      window.webkitIDBKeyRange ||
      window.msIDBKeyRange;

    var supported = !!window.indexedDB &&
        !!window.IDBTransaction &&
        !!window.IDBKeyRange;
  });

  /*
  Support for IndexedDB:

  http://caniuse.com/indexeddb
  http://btoe.ws/browserstats/#stats/indexeddb.json

  Supported in
    IE10
    Firefox
    Chrome

  Web SQL failed because it was too dependent on SQLite.
  Today, implementations of IndexedDB is built on by SQLite (or LevelDB).

  There is better support for Web SQL on mobile browsers than for IndexedDB:

  http://caniuse.com/sql-storage
  http://btoe.ws/browserstats/#stats/sql-storage.json

  Shims for IndexedDB are built on Web SQL:

  http://github.com/axemclion/IndexedDBShim
  */
});