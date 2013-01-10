var bongo = (function(bongo,window,console,Q){
  "use strict";

  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  if(!window.indexedDB) {
    console.log('IndexDB not supported');
    return bongo;
  }

  bongo.defineDatabase = function(database) {
    if(!database.name || !database.version) {
      console.log('Database name or version missing.');
      return false;
    }

    Object.defineProperty(bongo,database.name, {
      enumerable: false,
      get: function() {
        var defer = Q.defer();
        var request = window.indexedDB.open(database.name, database.version);
        request.onerror = function(event) {
          defer.reject(request.errorCode);
        };
        request.onsuccess = function(event) {
          defer.resolve(request.result);
        };
        request.onupgradeneeded = function(event) {
          var db = event.target.result;

          database.collections.forEach(function(collection) {
            var objectStore = db.createObjectStore(collection.name, {keyPath: "_id"});
            objectStore.createIndex(collection.name + '__id', '_id', {unique: true});
            if(collection.indexes) {
              collection.indexes.forEach(function(index) {

              });
            }
          });
        };
        return defer.promise;
      }
    });
  };

}(bongo || {},window,console,Q));