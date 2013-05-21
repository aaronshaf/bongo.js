module bongo {
  export class Query {
    _limit: number = 100;
    _skip: number = 0;
    from: any = null;
    to: any = null;
    before: any = null;
    after: any = null;
    filters: any[] = [];
    keys: string[] = [];

    constructor(public database,public objectStores) {}

    findOne(criteria,callback) {
      this.find(criteria).limit(1).toArray(function(error,results){
        if(error) return callback(error);
        if(!results.length) {
          callback(error,null);
        } else {
          callback(error,results[0]);
        }
      });
    }

    find(criteria = {}) {
      this.filters.push(function(doc) {
        var match = true;
        for(var key in criteria) {
          if(typeof criteria[key] === 'string') {
            if(typeof doc[key] === 'undefined' || doc[key] != criteria[key]) {
              return false;
            }
          } else if(typeof criteria[key] === 'object' && criteria[key] instanceof RegExp) {
            if(typeof doc[key] === 'undefined' || !criteria[key].test(doc[key])) {
              return false;
            }
          }
        }
        return match;
      });

      return this;
    }

    filter(fn) {
      this.filters.push(fn);
      return this;
    }

    skip(skip: number) {
      this._skip = skip;
      return this;
    }

    limit(limit: number) {
      this._limit = limit;
      return this;
    }

    pick(keys: string[]) {
      this.keys = keys;
      return this;
    }

    toArray(callback) {
      this.database.get((database) => {
        var transaction = database.transaction(this.objectStores, "readonly");
        var objectStore = transaction.objectStore(this.objectStores[0]);
        var results = [];

        var cursorSuccess = (event) => {
          if(event.target.error) {
            database.close();
            return callback(event.target.error);
          }

          var value,match,cursor = event.target.result;

          if(cursor) {
            value = cursor.value;
            if(!this.filters.length) {
              if(this._skip > 0) {
                this._skip--;
              } else {
                if(this.keys.length) {
                  value = pick(value,this.keys);
                }
                results.push(value);
              } 
            } else {
              match = true;
              for(var x = 0;x < this.filters.length;x++) {
                if(!this.filters[x](cursor.value)) {
                  match = false;
                }
              }
              if(match) {
                if(this.keys.length) {
                  value = pick(value,this.keys);
                }
                results.push(value);
              }
            }
            if(results.length < this._limit) {
              cursor.continue();
            } else {
              database.close();
              callback(null,results);
              return;
            }
          } else {
            database.close();
            callback(null,results);
            return;
          }
        }

        /*
        if(options.sort && objectStore.indexNames.contains(sortKeys[0])) {
          index = objectStore.index(sortKeys[0]);

          if(options.sort[sortKeys[0]] === 1) {
            index.openCursor().onsuccess = cursorSuccess;
          } else {
            index.openCursor(null, 'prev').onsuccess = cursorSuccess;
          }
          return;
        }
        */
        objectStore.openCursor().onsuccess = cursorSuccess;
      });
    }
  }

  function pick(obj,keys) {
    var copy = {};
    for(var x = 0;x < keys.length;x++) {
      if(keys[x] in obj) {
        copy[keys[x]] = obj[keys[x]]
      };
    }
    return copy;
  }
}

// See http://www.raymondcamden.com/index.cfm/2012/6/12/Issues-with-IndexedDB-and-Chrome