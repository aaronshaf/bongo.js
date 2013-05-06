module bongo {
  export class Query {
    limit: number = 100;
    skip: number = 0;
    from: any = null;
    to: any = null;
    before: any = null;
    after: any = null;
    filters: any[] = [];
    keys: string[] = [];

    constructor(public database,public objectStores) {}

    filter(fn) {
      this.filters.push(fn);
      return this;
    }

    limit(limit: number) {
      this.limit = limit;
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
            return callback(event.target.error);
          }

          var value,match,cursor = event.target.result;

          if(cursor) {
            value = cursor.value;
            if(!this.filters.length) {
              if(this.skip > 0) {
                this.skip--;
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
            if(this.limit || results.length < this.limit) {
              cursor.continue();
            } else {
              callback(null,results);
              return;
            }
          } else {
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