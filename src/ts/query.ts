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
      if(!bongo.supported) {
        return callback('IndexedDB not supported');
      }

      this.find(criteria).limit(1).toArray(function(error,results){
        if(error) return callback(error);
        if(!results.length) {
          callback(error,null);
        } else {
          callback(error,results[0]);
        }
      });
    }

    find(criteria = {},fields: any = null) {
      var key: string;
      if(fields && typeof fields === 'object') {
        var _fields = [];
        for(key in fields) {
          if(fields[key]) {
            _fields.push(key);
          }
        }
        this.pick(_fields);
      }
      this.filters.push(function(doc) {
        var match = true,x,y;
        for(var key in criteria) {
          if(criteria[key].constructor === Object) {
            for(x in criteria[key]) {
              if(x !== '$nin' && typeof doc[key] === 'undefined') {
                return false;
              }

              if(x === '$gt') {
                if(doc[key] <= criteria[key][x]) {
                  return false;
                }
              } else if(x === '$gte') {
                if(doc[key] < criteria[key][x]) {
                  return false;
                }
              } else if(x === '$lt') {
                if(doc[key] >= criteria[key][x]) {
                  return false;
                }
              } else if(x === '$lte') {
                if(doc[key] > criteria[key][x]) {
                  return false;
                }
              } else if(x === '$ne') {
                if(doc[key] == criteria[key][x]) {
                  return false;
                }
              } else if(x === '$in' && criteria[key][x] instanceof Array) {
                if(criteria[key][x].indexOf(doc[key]) === -1) {
                  return false;
                }
              } else if(x === '$nin' && criteria[key][x] instanceof Array) {
                if(criteria[key][x].indexOf(doc[key]) !== -1) {
                  return false;
                }
              } else if(x === '$all' && doc[key] instanceof Array && criteria[key][x] instanceof Array) {
                for(y = 0;y < criteria[key][x].length;y++) {
                  if(doc[key].indexOf(criteria[key][x][y]) === -1) {
                    return false;
                  }
                }
              } else {
                return false;
              }
            }
          } else if(typeof doc[key] === 'undefined') {
            return false;
          } else if(typeof criteria[key] === 'string' || typeof criteria[key] === 'number') {
            if(doc[key] != criteria[key]) {
              return false;
            }
          } else if(typeof criteria[key] === 'object' && criteria[key] instanceof RegExp) {
            if(!criteria[key].test(doc[key])) {
              return false;
            }
          }
        }
        return true;
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
      if(!bongo.supported) {
        return callback('IndexedDB not supported');
      }
      
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
                if(this._skip > 0) {
                  this._skip--;
                } else {
                  if(this.keys.length) {
                    value = pick(value,this.keys);
                  }
                  results.push(value); 
                }
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