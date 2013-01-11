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
      value: function(callback) {
        var request = window.indexedDB.open(this.database.name, this.database.version);

        request.onerror = function(event) {
          throw request.webkitErrorMessage || request.error.name;
        };

        request.onsuccess = function(event) {
          callback(event.target.result);
        };

        request.onupgradeneeded = function(event) {
          var db = event.target.result;
          this.database.collections.forEach(function(collection) {
            if(typeof collection === "string") {
              collection = {name: collection};
            }
            if(db.objectStoreNames.contains(collection.name)) {
              db.deleteObjectStore(collection.name);
            }
            var objectStore = db.createObjectStore(collection.name, {keyPath: "_id",autoIncrement:false});

            // objectStore.createIndex(collection.name + '__id', '_id', {unique: true});
            // if(collection.indexes) {
            //   collection.indexes.forEach(function(index) {

            //   });
            // }
          });
          callback(event.target.result);
        }.bind(this);
      }
    },

    "insert": {
      enumerable: false,
      writable: false,
      value: function(data, callback) {
        if(!data._id) {
          data._id = 'a' + Math.random(); //Just for now... for testing
        }

        this.db(function(){});
        this.db(function(db) {
          var transaction = db.transaction([this.collectionName], "readwrite");
          var objectStore = transaction.objectStore(this.collectionName);
          var request = objectStore.add(data);
          request.onsuccess = function(event) {
            callback(event.target.error,event.target.result);
          };
        }.bind(this));
      }
    },

    "count": {
      enumerable: false,
      writable: false,
      value: function(callback) {
        this.db(function(){});
        this.db(function(db) {
          var transaction = db.transaction([this.collectionName], "readonly");
          var objectStore = transaction.objectStore(this.collectionName);
          var request = objectStore.count();
          request.onsuccess = function(event) {
            callback(event.target.error,event.target.result);
          };
        }.bind(this));
      }
    },

    "remove": {
      enumerable: false,
      writable: false,
      value: function(id,callback) {
        this.db(function(){});
        this.db(function(db) {
          var transaction = db.transaction([this.collectionName], "readwrite");
          var objectStore = transaction.objectStore(this.collectionName);
          var request = objectStore.delete(id);
          request.onsuccess = function(event) {
            callback(event.target.error);
          };
        }.bind(this));
      }
    },

    "get": {
      enumerable: false,
      writable: false,
      value: function(criteria,callback) {
        this.db(function(){});
        this.db(function(db) {
          var transaction = db.transaction([this.collectionName], "readonly");
          var objectStore = transaction.objectStore(this.collectionName);
          var request = objectStore.get(criteria);
          request.onsuccess = function(event) {
            callback(event.target.error,event.target.result);
          };
        }.bind(this));
      }
    }
  });

  bongo.db = function(database) {
    if(!database.name || !database.version) {
      window.console.log('Database name or version missing.');
      return false;
    }

    if(database.version instanceof Date) {
      database.version = Math.round(database.version.getTime());
    }

    if(typeof bongo[database.name] !== 'undefined' && database.version === bongo[database.name].version) {
      return bongo[database.name];
    }

    database.collections.forEach(function(collection) {
      if(typeof collection === "string") {
        collection = {name: collection};
      }
      Object.defineProperty(database,collection.name, {
        enumerable: true,
        value: Object.create(bongo.Collection, {
          'collectionName' : {
            value: collection.name,
            enumerable: false,
            writable: false
          },
          'database': {
            value: database,
            enumerable: false
          }
        })
      });
    });

    bongo[database.name] = database;
    return database;
  };

  window.bongo = bongo;
}(window));