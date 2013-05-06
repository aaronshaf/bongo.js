module bongo {
  export class Database {
    name: string;
    collections: any[] = [];
    version: number;

    constructor(definition: DatabaseDefinition) {
      definition.collections = definition.collections || [];
      this.name = definition.name;
      this.setVersion(definition.version);
      for(var x = 0;x < definition.collections.length;x++) {
        var collection = new bongo.Collection(this,definition.collections[x]);
        this[collection.name] = collection;
        this.collections.push(collection);
      }
    }

    delete(callback = function() {}) {
      var tries = 0;
      for(var x = 0;x < this.collections.length;x++) {
        delete this[this.collections[x].name];
      }
      delete this.collections;

      var tryToDelete = () => {
        var request = window.indexedDB.deleteDatabase(this.name);

        request.onsuccess = (event) => {
          callback();
        }.bind(this);

        request.onblocked = (event) => {
          if(tries < 40) {
            setTimeout(() => {
              tryToDelete(); 
              tries++;
            },250);
          } else {
            throw request.webkitErrorMessage || request.error.name;
          }
        }.bind(this);

        request.onerror = (event) => {
          throw request.webkitErrorMessage || request.error.name;
        }.bind(this);
      }

      this.get((database) => {
        database.close();
        tryToDelete();  
      });
    }

    get(callback) {
      //if(this.instance) {
      //  return callback(this.instance);
      //}

      var request = window.indexedDB.open(this.name); //,this.version

      request.onblocked = (event) => {
        console.log('onblocked');
        throw request.webkitErrorMessage || request.error.name;
      };

      request.onerror = (event) => {
        console.log('onerror');
        throw request.webkitErrorMessage || request.error.name;
      };
      request.onfailure = request.onerror;

      request.onsuccess = (event) => {
        //console.log('onsuccess');
        callback(event.target.result);
      }.bind(this);

      request.onupgradeneeded = (event) => {
        //console.log('onupgradeneeded');

        for(var x = 0;x < this.collections.length;x++) {
          this.collections[x].createObjectStore(event.target.result);
        }
      }.bind(this);
    }

    setVersion(version) {
      if(version instanceof Date) {
        this.version = Math.round(version.getTime());
      }

      if(typeof version === "undefined") {
        // THIS CODE NEEDS SOME TENDER LOVING CARE

        var version;
        // var databaseString = JSON.stringify(database);
        // var dbCache = window.localStorage.getItem('bongo-' + database.name);
        // if(dbCache && (dbCache = JSON.parse(dbCache)) && databaseString === JSON.stringify(dbCache.definition)) {
        //   version = parseInt(dbCache.version,10);
        // } else {
          //version = lastMonday();
        // }

        // window.localStorage.setItem('bongo:' + database.name,JSON.stringify({
        //   definition: database,
        //   version: version
        // }));
        this.version = version;
      }
    }
  }
}