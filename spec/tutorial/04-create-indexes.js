describe("IndexedDB", function() {
  it("creates indexes", function() {
    var request = window.indexedDB.open('mydatabase',11);

    request.onupgradeneeded = function(event) {
      var db = request.result;

      if(!db.objectStoreNames.contains('employees')) {
        var objectStore = db.createObjectStore('employees', {
          keyPath: "_id",
          autoIncrement:false
        });
        objectStore.createIndex("name", "name", { unique: false });

        objectStore.createIndex("email", "email", { unique: true });

        objectStore.createIndex("positions", "positions", {
          unique: false,
          multiEntry: true
        });
      }

      // objectStore.createIndex("nameOfIndex", "keyPath", { unique: false, multiEntry: false });
      return;
    };
  });
});