(function(window){
  //"use strict";
  var bongo = {};

  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  if(!window.indexedDB) {
    throw 'IndexedDB not supported';
  }

  bongo.Collection = {};
  Object.defineProperties(bongo.Collection, {
    "objectStore": {
      enumerable: false,
      get: function(callback) {
        var request = window.indexedDB.open(database.name, database.version);

        request.onerror = function(event) {
          throw request.webkitErrorMessage || request.error.name;
        };

        request.onsuccess = function(event) {
          console.log('success');
        };

        request.onupgradeneeded = function(event) {
          console.log('onupgradeneeded');

          var db = event.target.result;
          console.log(db);

          database.collections.forEach(function(collection) {
            console.log(collection);

            if(db.objectStoreNames.contains(collection.name)) {
              db.deleteObjectStore(collection.name);
            }
            var objectStore = db.createObjectStore(collection.name, {keyPath: "id",autoIncrement: true});

            // objectStore.createIndex(collection.name + '__id', '_id', {unique: true});
            // if(collection.indexes) {
            //   collection.indexes.forEach(function(index) {

            //   });
            // }
          });
        };
      }
    },

    "find": {
      enumerable: false,
      writable: false,
      value: function() {
        if(!this.collectionName) {
          throw "Could not find collection name";
        }

        this.objectStore(function() {
          
        });

        //.add(customerData[i]);
      }
    }
  });

  bongo.defineDatabase = function(database) {
    if(!database.name || !database.version) {
      window.console.log('Database name or version missing.');
      return false;
    }

    var collections = [];

    database.collections.forEach(function(collection) {
      Object.defineProperty(database,collection.name,{

      });
    });

    if(database.version instanceof Date) {
      database.version = Math.round(database.version.getTime());
    }

    Object.defineProperty(bongo,database.name, {
      enumerable: true,
      configurable: true,
      get: function() {

        /*

        */
      }
    });

    return true;
  };

  window.bongo = bongo;

  if ( typeof define === "function" && define.amd && define.amd.bongo ) {
    define( "bongo", [], function () { return bongo; } );
  }
}(window));