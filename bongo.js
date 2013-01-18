// https://github.com/aaronshaf/bongo
// License: MIT

(function(window){
  "use strict";
  var bongo = {};

  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  if(!window.indexedDB) {
    throw 'IndexedDB not supported';
  }

  // bongo.Database = {};

  bongo.Collection = {};
  Object.defineProperties(bongo.Collection, {
    "db": {
      enumerable: false,
      value: function(callback) {
        if(this.database.instance) {
          return callback(this.database.instance);
        }
        var request = window.indexedDB.open(this.database.name, this.database.version);

        // self.postMessage({error:[this.database.name, this.database.version]});
  
        request.onblocked = function(event) {
          // self.postMessage({error:'blocked'});
          // self.postMessage({error:request.webkitErrorMessage || request.error.name});
        };

        request.onsuccess = function(event) {
          // self.postMessage({error:"success"});
          if(!this.database.instance) {
            this.database.instance = event.target.result;
          }
          callback(this.database.instance);
        }.bind(this);

        request.onerror = function(event) {
          // self.postMessage({error:'error'});
          throw request.webkitErrorMessage || request.error.name;
        };

        request.onupgradeneeded = function(event) {
          // self.postMessage({error:'Database upgrade needed.'});

          var db = event.target.result;
          var define = function(collection) {
            if(typeof collection === "string") {
              collection = {name: collection};
            }
            if(db.objectStoreNames.contains(collection.name)) {
              db.deleteObjectStore(collection.name);
            }
            var objectStore = db.createObjectStore(collection.name, {
              keyPath: "_id",
              autoIncrement:false
            });

            if(collection.indexes) {
              if(collection.indexes instanceof Array) {
                collection.indexes.forEach(function(index) {
                  if(typeof index === "string") {
                    objectStore.createIndex(index,index,{unique: false});
                  }
                });
              } else {
                // Add support for object literal
              }
            }
          };

          if(this.database.collections instanceof Array) {
           this. database.collections.forEach(function(collection) {
              define(collection);
            });
          } else {
            var collection, collectionName;
            for(collectionName in this.database.collections) {
              collection = this.database.collections[collectionName];
              collection.name = collectionName;
              define(collection);
            }
          }
          callback(event.target.result);
        }.bind(this);
      }
    },

    "prepare": {
      enumerable: false,
      writable: false,
      value: function(data) {
        var x;
        //If there's an indexed field in the record that is boolean, change to 0/1 number
        
        var prepare = function(data) {
          if(this.indexes instanceof Array) {
            // self.postMessage({error:1});
            this.indexes.forEach(function(index) {
              if(typeof data[index] === "boolean") {
                data[index] = data[index] ? 1 : 0;
              }
            });
          }
          return data;
        }.bind(this);

        if(data instanceof Array) {
          for(x = 0;x < data.length;x++) {
            data[x] = prepare(data[x]);
          }
        } else {
          data = prepare(data);
        }

        return data;
      }
    },

    "insert": {
      enumerable: false,
      writable: false,
      value: function(data, callback) {
        if(!data._id) {
          data._id = bongo.key();
        }
        data = this.prepare(data);

        // this.db(function(){});
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

    "save": {
      enumerable: false,
      writable: false,
      value: function(data, callback) {
        callback = callback || noop;
        data = this.prepare(data);
        //this.db(function(){});
        this.db(function(db) {
          var transaction = db.transaction([this.collectionName], "readwrite");
          var objectStore = transaction.objectStore(this.collectionName);
          var ids = [];

          var save = function(data) {
            if(typeof data === "undefined") return;
            var request;

            if(!data._id) {
              data._id = bongo.key();
              request = objectStore.add(data);
              request.onsuccess = function(event) {
                if(!event.target.error && event.target.result) {
                  ids.push(event.target.result);
                }
              };
            } else {
              request = objectStore.get(data._id);
              request.onsuccess = function(event) {
                var request;

                if(!event.target.result) {
                  request = objectStore.add(data);
                } else {
                  data = extend(event.target.result,data);
                  request = objectStore.put(data);
                }
                
                request.onerror = function(event) {
                  //console.log(event);
                };
                request.onsuccess = function(event) {
                  if(!event.target.error && event.target.result) {
                    ids.push(event.target.result);
                  }
                };
              };
            }
          };

          if(data instanceof Array) {
            data.forEach(function(record) {
              save(record);
            });
          } else {
            save(data);
          }

          transaction.oncomplete = function() {
            callback(null,ids);
          };

        }.bind(this));
      }
    },

    "count": {
      enumerable: false,
      writable: false,
      value: function(callback) {
        // this.db(function(){});
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
        if(typeof id === "undefined" || !id) return;
        callback = callback || noop;
        // this.db(function(){});
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
      value: function(criteria, callback) {
        // this.db(function(){});
        this.db(function(db) {
          var transaction = db.transaction([this.collectionName], "readonly");
          var objectStore = transaction.objectStore(this.collectionName);
          var request = objectStore.get(criteria);
          request.onsuccess = function(event) {
            callback(event.target.error,event.target.result);
          };
        }.bind(this));
      }
    },

    "find": {
      enumerable: false,
      writable: false,
      value: function(criteria, callback) {
        this.db(function(){});
        this.db(function(db) {
          var transaction = db.transaction([this.collectionName], "readonly");
          var objectStore = transaction.objectStore(this.collectionName);

          var criteriaKeys = Object.keys(criteria);
          var data = [];

          if(criteriaKeys.length === 1 &&
              objectStore.indexNames &&
              objectStore.indexNames.contains(criteriaKeys[0])) {
            var index = objectStore.index(criteriaKeys[0]);

            if(typeof criteria[criteriaKeys[0]] === "boolean") {
              criteria[criteriaKeys[0]] = criteria[criteriaKeys[0]] ? 1 : 0;
            }
            var singleKeyRange = window.IDBKeyRange.only(criteria[criteriaKeys[0]]);

            index.openCursor(singleKeyRange).onsuccess = function(event) {
              if(event.target.error) {
                return callback(event.target.error);
              }
              var cursor = event.target.result;
              if(cursor) {
                data.push(cursor.value);
                cursor['continue']();
              } else {
                callback(null,data);
              }
            };
          } else {
            objectStore.openCursor().onsuccess = function(event) {
              if(event.target.error) {
                return callback(event.target.error);
              }

              var cursor = event.target.result;
              if(cursor) {
                if(!criteriaKeys.length) {
                  data.push(cursor.value);
                } else {
                  var match = true;
                  var key;
                  for(key in criteriaKeys) {
                    if(typeof cursor.value[criteriaKeys[key]] === "undefined" || cursor.value[criteriaKeys[key]] !== criteria[criteriaKeys[key]]) {
                      // self.postMessage({
                      //   error: cursor.value[criteriaKeys[key]] + ' !== ' + criteria[criteriaKeys[key]]
                      // });
                      match = false;
                    }
                  }
                  if(match) {
                    data.push(cursor.value);
                  }
                }
                cursor['continue']();
              } else {
                callback(null,data);
              }
            };
          }
        }.bind(this));
      }
    }
  });

  bongo.key = function() { //A cheap Mongo-esque key
    var key_t = Math.floor(new Date().valueOf() / 1000).toString(16);
    if(!this.key_m) {
      this.key_m = Math.floor(Math.random() * (16777216)).toString(16);
    }
    if(!this.key_p) {
      this.key_p = Math.floor(Math.random() * (32767)).toString(16);
    }
    if(typeof this.key_i === "undefined") {
      this.key_i = 0;
    } else if(this.key_i > 0xffffff) {
      this.key_i = 0;
    }
    this.key_i = Number(this.key_i);
    
    this.key_i++;
    var i = this.key_i.toString(16);

    var r = '00000000'.substr(0, 6 - key_t.length) + key_t +
        '000000'.substr(0, 6 - this.key_m.length) + this.key_m +
        '0000'.substr(0, 4 - this.key_p.length) + this.key_p +
        '000000'.substr(0, 6 - i.length) + i;
    return r;
  };

  var noop = function() {};

  var extend = function(destination, source) {
    destination = destination || {};
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
    return destination;
  };

  var lastMonday = function() {
    var d = new Date();
    d.setHours(0,0,0,0);
    var dif = (d.getDay() + 6) % 7;
    return new Date(d - dif * 24 * 60 * 60 * 1000);
  };

  function clone(obj) {
    var clonedObject = Object.create(obj.prototype || null);
    Object.keys(obj).map(function (i) {
      clonedObject[i] = obj[i];
    });
    return clonedObject;
  }

  bongo.db = function(database,collections) {
    if(typeof database === "string") {
      database = {
        name: database
      };
    }

    if(!database.name) {
      //window.console.log('Database name missing.');
      return false;
    }

    if(typeof collections !== "undefined" && collections instanceof Array) {
      database.collections = collections;
    }
    
    database = clone(database);

    if(typeof database.version === "undefined") {
      // THIS CODE NEEDS SOME TENDER LOVING CARE
      var version;
      // var databaseString = JSON.stringify(database);
      // var dbCache = window.localStorage.getItem('bongo-' + database.name);
      // if(dbCache && (dbCache = JSON.parse(dbCache)) && databaseString === JSON.stringify(dbCache.definition)) {
      //   version = parseInt(dbCache.version,10);
      // } else {
        version = lastMonday();
      // }

      // window.localStorage.setItem('bongo:' + database.name,JSON.stringify({
      //   definition: database,
      //   version: version
      // }));
      database.version = version;
    }

    if(database.version instanceof Date) {
      database.version = Math.round(database.version.getTime());
    }

    // self.postMessage({info:database.version});
    if(typeof bongo[database.name] !== 'undefined' && database.version === bongo[database.name].version) {
      return bongo[database.name];
    }

    var define = function(collection) {
      if(typeof collection === "string") {
        collection = {name: collection};
      }
      Object.defineProperty(database,collection.name, {
        enumerable: false,
        value: Object.create(bongo.Collection, {
          'collectionName' : {
            value: collection.name,
            enumerable: false,
            writable: false
          },
          'database': {
            value: database,
            enumerable: false
          },
          'indexes': {
            value: collection.indexes || [],
            enumerable: false
          }
        })
      });
    };

    if(database.collections instanceof Array) {
      database.collections.forEach(function(collection) {
        define(collection);
      });
    } else {
      var collection, collectionName;
      for(collectionName in database.collections) {
        collection = database.collections[collectionName];
        collection.name = collectionName;
        define(collection);
      }
    }

    Object.defineProperty(database,'delete', {
      enumerable: false,
      value: function() {
        var request = window.indexedDB.deleteDatabase(database.name);
      }
    });

    bongo[database.name] = database;
    return database;
  };

  window.bongo = bongo;
}(window || self));