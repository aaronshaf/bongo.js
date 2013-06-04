module bongo {
  export class Database {
    name: string;
    version: number;
    ensured: Boolean = false;
    objectStores: any[] = [];

    constructor(definition: DatabaseDefinition,callback = function() {}) {
      var name: string;
      var objectStore: any;
      var definition: any;
      var indexes: any;

      definition.objectStores = definition.objectStores || definition.collections || [];
      this.name = definition.name;
      if(definition.objectStores instanceof Array) {
        for(var x = 0;x < definition.objectStores.length;x++) {
          if(typeof definition.objectStores[x] === 'string') {
            definition.objectStores[x] = {
              name: definition.objectStores[x]
            }
          }
          objectStore = new bongo.ObjectStore(this,definition.objectStores[x]);
          this[objectStore.name] = objectStore;
          this.objectStores.push(objectStore);
        }
      } else {
        for(name in definition.objectStores) {
          if(definition.objectStores[name] instanceof Array) {
            indexes = {};
            definition.objectStores[name].forEach(function(index) {
              indexes[index] = {
                keyPath: index,
                multiEntry: false, // For now
                unique: false // For now
              };
            });
            definition.objectStores[name] = {
              name: name,
              indexes: indexes
            }
          }
          objectStore = new bongo.ObjectStore(this,definition.objectStores[name]);
          this[objectStore.name] = objectStore;
          this.objectStores.push(objectStore);
        }
      }
      if(bongo.supported) this.ensure(callback);
    }

    collection(name) {return this[name];}
    objectStore(name) {return this[name];}

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

    // "Databases has a delete pending flag which is used during deletion.
    // When a database is requested to be deleted the flag is set to true
    // and all attempts at opening the database are stalled until the
    // database can be deleted." - W3 Spec, http://goo.gl/adPjR
    delete(callback = function() {}) {
      // Check for transaction on objectStores?

      var tries = 0;
      for(var x = 0;x < this.objectStores.length;x++) {
        delete this[this.objectStores[x].name];
      }
      delete this.objectStores;

      var tryToDelete = () => {
        var request = bongo.indexedDB.deleteDatabase(this.name);

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

    // https://groups.google.com/a/chromium.org/forum/#!topic/chromium-html5/RQFrG9SDPTI/discussion
    // "Can transactions remain open between page reloads?"
    //   Unfortunately in Chrome, it seem so.
    get(callback) {
      var tries = 500;
      var tryToOpen = () => {
        if(!this.ensured) {
          if(bongo.debug) console.log('Database not ensured yet');
          tries--;
          if(tries > 0) {
            setTimeout(() => {
              tryToOpen();
            },200);
          }
          return;
        }
        if(bongo.debug) console.log('Database is ensured');

        var request = bongo.indexedDB.open(this.name);

        request.onupgradeneeded = (event) => {
          // This should never be called here. It should be covered by the initial 'ensure'
          if(bongo.debug) console.debug('onupgradeneeded');
          var db = request.result;
          /*
          for(var x = 0;x < this.objectStores.length;x++) {
            this.objectStores[x].ensureObjectStore(db);
          }
          for(var name in signature.objectStores) {
            if(typeof this[name] === 'undefined' && db.objectStoreNames.contains(name)) {
              db.deleteObjectStore(name);
            }
          }
          */
          // db.close();
        };

        request.onsuccess = (event) => {
          if(bongo.debug) console.debug('onsuccess');
          callback(event.target.result);
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
      };
      tryToOpen();   
    }

    ensure(callback = function() {}) {
      if(bongo.debug) console.debug('Ensuring ' + this.name);
      // Compare signature of definition and definition of current database
      bongo.getStoredSignature(this.name,(signature) => {
        if(bongo.debug) console.debug('Signature found: ' + JSON.stringify(signature));
        if(bongo.equals(signature,this.signature())) {
          bongo.getStoredVersion(this.name,(version) => {
            this.version = version;
            callback();
          });
          this.ensured = true;
          return;
        }
        bongo.getStoredVersion(this.name,(version) => {
          if(bongo.debug) console.debug('Version found: ' + version);
          this.version = version + 1;

          var request = bongo.indexedDB.open(this.name,this.version);
          request.onblocked = (event) => {
            console.log('blocked',request.error.name);
          }
          // request.onsuccess = () => {
          //   callback();
          // }

          // See: https://groups.google.com/a/chromium.org/forum/?fromgroups#!topic/chromium-html5/pHoKbX78rxA
          // See: https://groups.google.com/a/chromium.org/forum/?fromgroups#!topic/chromium-html5/8C-NWF2FajA
          request.onupgradeneeded = (event) => {
            if(bongo.debug) console.debug('onupgradeneeded in ensure, version ' + this.version);
            var transaction = event.currentTarget.transaction;
            var db = request.result;
            for(var x = 0;x < this.objectStores.length;x++) {
              this.objectStores[x].ensureObjectStore(transaction,signature,db);
            }
            for(var name in signature.objectStores) {
              if(typeof this[name] === 'undefined' && db.objectStoreNames.contains(name)) {
                db.deleteObjectStore(name);
              }
            }

            // Not sure why this is necessary yet, but it breaks otherwise
            if(this.version > 2) {
              db.close(); 
            }

            setTimeout(function(){
              callback();
            },1);
            this.ensured = true;
          };
        });
      });
    }
  }
}