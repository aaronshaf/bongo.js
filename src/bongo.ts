/// <reference path="bongo.d.ts" />
/// <reference path="database.ts" />
/// <reference path="collection.ts" />
/// <reference path="query.ts" />

module bongo {
  export function supported() {
    // Ensure support
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    return !!window.indexedDB && !!window.IDBTransaction && !!window.IDBKeyRange;
  }

  export function db(definition: DatabaseDefinition) {
    // Is database already defined? If so, just return it
    if(typeof bongo[definition.name] === 'undefined') { // && definition.version === bongo[definition.name].version
      Object.defineProperty(bongo,definition.name,{
        value: new bongo.Database(definition)
      });
    }

    return bongo[definition.name];
  }
  export var debug = false;

  export function signature(name,callback = function() {}) {
    var request = window.indexedDB.open(name);
    request.onsuccess = function(event) {
      var x,db = event.target.result;
      var objectStore,objectStores = [];

      for(x = 0;x < db.objectStoreNames.length;x++) {
        objectStores.push(db.objectStoreNames.item(x));
      }
      var transaction = db.transaction(objectStores, "readonly");
      
      objectStores = objectStores.map(function(objectStoreName) {
        var objectStore = transaction.objectStore(objectStoreName);
        console.log(objectStore);
        var indexNames = [];
        for(var x = 0;x < objectStore.indexNames.length;x++) {
          indexNames.push(objectStore.indexNames.item(x));
        }
        return {
          autoIncrement: objectStore.autoIncrement,
          indexNames: indexNames,
          keyPath: objectStore.keyPath,
          name: objectStore.name
        };
      });

      callback({
        name: db.name,
        objectStores: objectStores,
        version: db.version
      });
      db.close(name);
    };
  }

  export function normalizeSignature(signature) {

  }

  export function info(name = null) {
    console.group('Bongo')
    var request;

    var debugDb = function(name) {
      var request = window.indexedDB.open(name);
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
      if(window.indexedDB.webkitGetDatabaseNames) {
        request = window.indexedDB.webkitGetDatabaseNames();
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