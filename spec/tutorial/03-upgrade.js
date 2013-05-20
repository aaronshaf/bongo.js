describe("IndexedDB", function() {
  it("upgrades database with objectStores", function() {
    // version += 1;
    var dbRequest = window.indexedDB.open('MyDatabase',4);

    dbRequest.onsuccess = function(event) {

    };
    dbRequest.onblocked = function(event) {
      console.log(event);

    };

    // Called upon first open, or when version is newer
    dbRequest.onupgradeneeded = function(event) {
      var db = dbRequest.result;

      // "The object store can derive the key from
      // one of three sources: a key generator,
      // a key path, and an explicitly specified value." (MDN)

      // "Each record in an object store must have
      // a key that is unique within the same store." (MDN)

      // In-line key -- stored as part of value
      var usersObjectStore = db.createObjectStore("users", {
        keyPath: "email",
        autoIncrement: false
      });

      // Out-of-line key -- stored separately from value
      var messagesObjectStore = db.createObjectStore("messages");
    };
  });
});