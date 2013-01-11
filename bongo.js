(function(window){
  //"use strict";
  var bongo = {};

  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  if(!window.indexedDB) {
    throw 'IndexedDB not supported';
  }

  bongo.Database = {};

  bongo.Collection = {};
  Object.defineProperties(bongo.Collection, {
    "db": {
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
            if(db.objectStoreNames.contains(collection.name)) {
              db.deleteObjectStore(collection.name);
            }
            var objectStore = db.createObjectStore(collection.name, {keyPath: "_id"});

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

        var transaction = db.transaction([this.collectionName], "readonly");

        this.objectStore(function() {
          var transaction = db.transaction(["customers"], "readwrite");
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

    if(database.version instanceof Date) {
      database.version = Math.round(database.version.getTime());
    }

    database.collections.forEach(function(collection) {
      Object.defineProperty(database,collection.name, {
        enumerable: true,
        value: Object.create(bongo.Collection, {
          'collectionName' : {
            value: collection.name,
            enumerable: false,
            writable: false
          },
          'databaseName': {
            value: database.name,
            enumerable: false
          }
        })
      });
    });

    bongo[database.name] = database;
    return database;
  };

  window.bongo = bongo;

  if ( typeof define === "function" && define.amd && define.amd.bongo ) {
    define( "bongo", [], function () { return bongo; } );
  }
}(window));