module bongo {
  export class Database {
    name: string;
    version: number;
    versionChecked: Boolean = false;
    objectStores: any[] = [];

    constructor(definition: DatabaseDefinition) {
      definition.objectStores = definition.objectStores || [];
      this.name = definition.name;
      for(var x = 0;x < definition.objectStores.length;x++) {
        if(typeof definition.objectStores[x] === 'string') {
          definition.objectStores[x] = {
            name: definition.objectStores[x]
          }
        };
        var objectStore = new bongo.ObjectStore(this,definition.objectStores[x]);
        this[objectStore.name] = objectStore;
        this.objectStores.push(objectStore);
      }
      this.ensure();
    }

    signature() {
      var objectStores = {};
      this.objectStores.forEach(function(objectStore) {
        objectStores[objectStore.name] = {
          autoIncrement: objectStore.autoIncrement,
          indexes: objectStore.indexes,
          keyPath: objectStore.keyPath,
          name: objectStore.name
        };
      });

      return {
        name: this.name,
        objectStores: objectStores
      };
    }

    delete(callback = function() {}) {
      // Check for transaction on objectStores?

      var tries = 0;
      for(var x = 0;x < this.objectStores.length;x++) {
        delete this[this.objectStores[x].name];
      }
      delete this.objectStores;

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
      var request = window.indexedDB.open(this.name);

      request.onupgradeneeded = (event) => {
        if(bongo.debug) console.debug('onupgradeneeded');
        for(var x = 0;x < this.objectStores.length;x++) {
          this.objectStores[x].ensureObjectStore(request.result);
        }
      };

      request.onsuccess = (event) => {
        if(bongo.debug) console.debug('onsuccess');

        callback(request.result);
      }

      request.onblocked = (event) => {
        console.log(this.version,request);
        console.log('onblocked');
        throw request.webkitErrorMessage || request.error.name;
      };

      request.onerror = (event) => {
        console.log('onerror');
        throw request.webkitErrorMessage || request.error.name;
      };
      request.onfailure = request.onerror;
            
    }

    ensure(callback = function() {}) {
      // Compare signature of definition and definition of current database
      bongo.getStoredSignature(this.name,(signature) => {
        if(bongo.equals(signature,this.signature())) {
          bongo.getStoredVersion(this.name,(version) => {
            this.version = version;
            callback();
          });
          return;
        }
        console.log();
        bongo.getStoredVersion(this.name,(version) => {
          this.version = version + 1;

          var request = window.indexedDB.open(this.name,this.version);
          request.onblocked = (event) => {
            //console.log('blocked',request.error.name);
          }
          request.onsuccess = () => {
            callback();
          }
          request.onupgradeneeded = (event) => {
            var db = request.result;
            for(var x = 0;x < this.objectStores.length;x++) {
              this.objectStores[x].ensureObjectStore(db);
            }
            for(var name in signature.objectStores) {
              if(typeof this[name] === 'undefined' && db.objectStoreNames.contains(name)) {
                db.deleteObjectStore(name);
              }
            }
          };
        });
      });
    }
  }
}