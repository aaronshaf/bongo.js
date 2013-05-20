/// <reference path="bongo.d.ts" />
/// <reference path="database.ts" />
/// <reference path="objectstore.ts" />
/// <reference path="query.ts" />

module bongo {
  export var debug = false;

  export var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  export var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  export var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  export var supported = !!bongo.indexedDB && !!bongo.IDBTransaction && !!bongo.IDBKeyRange;

  export function db(definition: DatabaseDefinition,callback = function() {}) {
    if(typeof bongo[definition.name] === 'undefined') {
      Object.defineProperty(bongo,definition.name,{
        value: new bongo.Database(definition,callback)
      });
    }

    return bongo[definition.name];
  }

  export function getStoredVersion(name,callback = function(version: number) {console.log(version);}) {
    var request = bongo.indexedDB.open(name);
    request.onsuccess = function(event) {
      var db = event.target.result;
      db.close();
      callback(db.version);
    }
  }

  export function getStoredSignature(name,callback = function(signature: any) {console.log(signature)}) {
    var request = bongo.indexedDB.open(name);

    request.onblocked = (event) => {
      console.log('blocked',event);
      //callback({});
    };

    request.onsuccess = function(event) {
      var x,indexes,db = event.target.result;
      var name,objectStore,objectStoreNames = [],objectStores = {};

      for(x = 0;x < db.objectStoreNames.length;x++) {
        objectStoreNames.push(db.objectStoreNames.item(x));
      }

      if(objectStoreNames.length) {
        var transaction = db.transaction(objectStoreNames, "readonly");
        objectStoreNames.forEach(function(objectStoreName) {
          var objectStore = transaction.objectStore(objectStoreName);
          indexes = [];
          for(var x = 0;x < objectStore.indexNames.length;x++) {
            indexes.push(objectStore.indexNames.item(x));
          }
          objectStores[objectStoreName] = {
            autoIncrement: objectStore.autoIncrement,
            indexes: indexes,
            keyPath: objectStore.keyPath,
            name: objectStore.name
          };
        });
        transaction.oncomplete = function() {
          db.close(name);
          return callback({
            name: db.name,
            objectStores: objectStores
          });
        };
      } else {
        db.close(name);
        return callback({
          name: db.name,
          objectStores: objectStores
        });
      }
    };
  }

  // For comparing database signatures
  export function equals (x,y) {
    var p;
    if(x === y) return true;
    
    for(p in x) {
      if(typeof(y[p])=='undefined') {return false;}
    }
    
    for(p in y) {
      if(typeof(x[p])=='undefined') {return false;}
    }
    
    if(typeof x !== typeof y) return false;

    if(typeof x === 'object') {
      for(p in x) {
        if(x[p]) {
          if(typeof(x[p]) === 'object') {
            if(!equals(x[p],y[p])) {
              return false;
            } 
          } else {
            if (x[p] !== y[p]) { return false; }
          }
        } else {
          if(y[p]) return false;
        }
      }
    } else {
      return x === y; 
    }
    return true;
  }

  // Modeled after Linq2IndexedDB's closeConnection
  export function close(target) {
    var db;
    if (target instanceof window.IDBCursor) {
      target = target.source;
    }

    if(target instanceof window.IDBDatabase) {
      db = target;
    } else if (target instanceof window.IDBTransaction) {
      db = target.db;
    } else if (target instanceof window.IDBObjectStore || target instanceof bongo.IDBRequest) {
      db = target.transaction.db;
    } else if (target instanceof window.IDBIndex) {
      db = target.objectStore.transaction.db;
    }

    if(typeof (db) !== "undefined" && db != null && typeof (db.close) != "undefined") {
      db.close();
    }
  }

  export function info(name = null) {
    console.group('Bongo')
    var request;

    var debugDb = function(name) {
      var request = bongo.indexedDB.open(name);
      request.onsuccess = function(event) {
        var db = event.target.result;
        // console.log(db);
        var objectStoreNames = [];
        for(var x = 0;x < db.objectStoreNames.length;x++) {
          objectStoreNames.push(db.objectStoreNames.item(x));
        }
        console.log({
          name: db.name,
          objectStores: objectStoreNames,
          version: db.version
        });
      };
    }

    if(name) {
      debugDb(name);
    } else {
      if(bongo.indexedDB.webkitGetDatabaseNames) {
        request = bongo.indexedDB.webkitGetDatabaseNames();
        request.onsuccess = function(event) {
          var dbNameList = event.target.result;
          for(var x = 0;x < dbNameList.length;x++) {
            debugDb(dbNameList.item(x));
          }
        }
      }
    }
    console.groupEnd();
  }
}