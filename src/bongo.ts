/// <reference path="bongo.d.ts" />
/// <reference path="database.ts" />
/// <reference path="collection.ts" />

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
}