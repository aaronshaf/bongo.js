module bongo {
  export class ObjectStore {
    constructor(public database,definition: DatabaseDefinition) {
      this.name = definition.name;
      this.keyPath = definition.keyPath || '_id';
      this.autoIncrement = !!definition.autoIncrement;
      this.indexes = definition.indexes || [];
      //this.compoundIndexes = findCompoundIndexes(objectStore.indexes || []);
    }

    filter(fn) {
      var query = new bongo.Query(this.database,[this.name]);
      return query.filter(fn);
    }

    find(criteria) {
      var query = new bongo.Query(this.database,[this.name]);
      return query.find(criteria);
    }

    findOne(criteria) {
      var query = new bongo.Query(this.database,[this.name]);
      return query.findOne(criteria);
    }

    count(criteria,callback) {
      if(typeof callback === 'undefined' && typeof criteria === 'function') {
        callback = [criteria, criteria = null][0]; // Is this fancy way even necessary?
      }

      var request;

      var success = (event) => {
        callback(event.target.result);
      };
      this.database.get((database) => {
        var transaction = database.transaction([this.name], "readonly");
        var objectStore = transaction.objectStore(this.name);

        /*
        if(criteria) {
          var criteriaKeys = Object.keys(criteria);
          if(criteriaKeys.length === 1 &&
              objectStore.indexNames &&
              objectStore.indexNames.contains(criteriaKeys[0])) {
            var index = objectStore.index(criteriaKeys[0]);
            var range = window.IDBKeyRange.only(criteria[criteriaKeys[0]]);
            request = index.count(range);
            request.onsuccess = success;
            return;
          }
        }
        */

        request = objectStore.count();
        request.onsuccess = success;
      }.bind(this));
    }

    ensureObjectStore(database) {
      if(bongo.debug) console.debug('ensureObjectStore');
      if(!database.objectStoreNames || !database.objectStoreNames.contains(this.name)) {
        if(bongo.debug) console.debug('Creating ' + this.name);
        var objectStore = database.createObjectStore(this.name, {
          keyPath: "_id",
          autoIncrement:false
        });
      } else {
        // Check to see if keyPath or autoIncrement has changed
        // If so, recreate objectStore

        // Check to see if indexes have changed
      }

      /*
      this.indexes.forEach(function(index) {
        if(index instanceof Array) {
          objectStore.createIndex(index.join(),index,{unique: false});
        } else if(typeof index === "string") {
          objectStore.createIndex(index,index,{unique: false});
        }
      });
      */ 
      return objectStore; 
    }

    get(id: string = '',callback = function(error,result) {}) {
      this.database.get((database) => {
        var transaction = database.transaction([this.name], "readonly");
        var objectStore = transaction.objectStore(this.name);
        var request = objectStore.get(id);
        request.onsuccess = function(event) {
          callback(event.target.error,event.target.result);
        };
      }.bind(this));
    }

    remove(criteria: any,callback = function(error,result) {}) {
      this.database.get((database) => {
        var transaction = database.transaction([this.name], "readwrite");
        var objectStore = transaction.objectStore(this.name);
        var request;
        if(typeof criteria === "string") {
          request = objectStore.delete(criteria);  
        } else if(JSON.stringify(criteria) === "{}") {
          request = objectStore.clear();  
        }
        request.onsuccess = function(event) {
          callback(event.target.error,event.target.result);
        };
      },true);
    }

    save(data, callback: Function = function() {}) {
      if(!data._id) {
        data._id = bongo.key();
      }

      this.database.get((database) => {
        var transaction = database.transaction(this.name, "readwrite");
        var objectStore = transaction.objectStore(this.name);
        var request = objectStore.put(data);
        request.onsuccess = function(event) {
          callback(event.target.error,event.target.result);
        };
      },true);
    }

    insert(data, callback: Function = function() {}) {
      if(!data._id) {
        data._id = bongo.key();
      }

      this.database.get((database) => {
        var transaction = database.transaction([this.name], "readwrite");
        var objectStore = transaction.objectStore(this.name);
        var request = objectStore.add(data);
        request.onsuccess = function(event) {
          callback(event.target.error,event.target.result);
        };
      },true);
    }

    oldFind(options,callback) {
      var criteria = options.criteria || {};
      var skip = options.skip || 0;

      this.database.get((database) => {
        var transaction = database.transaction([this.name], "readonly");
        var objectStore = transaction.objectStore(this.name);
        var sortKeys = [];
        if(options.sort){
          sortKeys = Object.keys(options.sort);
        }

        var criteriaKeys = Object.keys(criteria);
        if(typeof criteria[criteriaKeys[0]] === "boolean") {
          criteria[criteriaKeys[0]] = criteria[criteriaKeys[0]] ? 1 : 0;
        }
        var data = [];
        var range,index,cursorSuccess;

        if(criteriaKeys.length === 1 &&
            objectStore.indexNames &&
            objectStore.indexNames.contains(criteriaKeys[0])) {
          cursorSuccess = function(event) {
            if(event.target.error) {
              return callback(event.target.error);
            }
            var cursor = event.target.result;

            if(skip > 0) {
              skip--;
            } else if(cursor) {
              data.push(cursor.value);
            }

            if(cursor && (!options.limit || data.length < options.limit)) {
              cursor['continue']();
            } else {
              callback(null,data);
              return;
            }
          };

          /*
          if(options.sort && this.compoundIndexes.length) {
            var compoundKey = [criteriaKeys[0],sortKeys[0]].join();
            if(compoundKey === this.compoundIndexes[0].join()) {
              // var singleKeyRange = window.IDBKeyRange.only(criteria[criteriaKeys[0]]);
              // console.log([[criteria[criteriaKeys[0]],[]], [criteria[criteriaKeys[0]],"zzzzzzzzz"], true, true]);
              range = window.IDBKeyRange.bound([criteria[criteriaKeys[0]],0], [criteria[criteriaKeys[0]],"zzzzzzzzz"], true, true);
              index = objectStore.index(this.compoundIndexes[0].join());

              if(options.sort[sortKeys[0]] !== 1) {
                index.openCursor(range, 'prev').onsuccess = cursorSuccess;
              } else {
                index.openCursor(range).onsuccess = cursorSuccess;
              }
              return;
            }
          }
          */

          index = objectStore.index(criteriaKeys[0]);
          range = window.IDBKeyRange.only(criteria[criteriaKeys[0]]);
          index.openCursor(range).onsuccess = cursorSuccess;
          return;
        }

        cursorSuccess = function(event) {
          if(event.target.error) {
            return callback(event.target.error);
          }

          var cursor = event.target.result;
          if(cursor) {
            if(!criteriaKeys.length) {
              if(skip > 0) {
                skip--;
              } else if(cursor) {
                data.push(cursor.value);
              }
            } else {
              var match = true;
              var key;
              for(key in criteriaKeys) {
                if(typeof cursor.value[criteriaKeys[key]] === "undefined" || cursor.value[criteriaKeys[key]] !== criteria[criteriaKeys[key]]) {
                  match = false;
                }
              }
              if(match) {
                data.push(cursor.value);
              }
            }
            if(!options.limit || data.length < options.limit) {
              cursor['continue']();
            } else {
              callback(null,data);
              return;
            }
          } else {
            callback(null,data);
            return;
          }
        };

        if(options.sort && objectStore.indexNames.contains(sortKeys[0])) {
          index = objectStore.index(sortKeys[0]);

          if(options.sort[sortKeys[0]] === 1) {
            index.openCursor().onsuccess = cursorSuccess;
          } else {
            index.openCursor(null, 'prev').onsuccess = cursorSuccess;
          }
          return;
        }

        objectStore.openCursor().onsuccess = cursorSuccess;
      });
    }
  }

//A cheap Mongo-esque key
  export function key {
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
  }
}

/*

    
  }

  function db(database,objectStores) {
    if(typeof database === "string") {
      database = {
        name: database
      };
    }

    if(!database.name) {
      //window.console.log('Database name missing.');
      return false;
    }

    if(typeof objectStores !== "undefined" && objectStores instanceof Array) {
      database.objectStores = objectStores;
    }
    
    database = clone(database);

    function findCompoundIndexes(indexes) {
      var compoundIndexes = [];
      indexes.forEach(function(index) {
        if(index instanceof Array) {
          compoundIndexes.push(index);
        }
      });
      return compoundIndexes;

      // for(x = 0;x > objectStore.indexNames.length;x++) {
      //   if(objectStore.indexNames.item(x).indexOf(',') !== -1) {
      //     fields = objectStore.indexNames.item(x).split(',');
      //     hasAllFields = true;
      //     fields.forEach(function(field) {
            
      //     });
      //   }
      // }
    }

    
  };
}
*/