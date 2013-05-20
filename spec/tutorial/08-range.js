describe("IndexedDB", function() {
  it("uses index keys, ranges, and direction", function() {
    var dbRequest = window.indexedDB.open('MyDatabase');
    dbRequest.onsuccess = function(event) {
      var db = dbRequest.result;
      var objectStore = db.transaction("users").objectStore("users");

      var users = [];
      var index = objectStore.index("email");

      // From https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB

      var singleKeyRange = IDBKeyRange.only("jane@doe.com");

      // >=
      var lowerBoundKeyRange = IDBKeyRange.lowerBound(60000);

      // >
      var lowerBoundOpenKeyRange = IDBKeyRange.lowerBound(60000, true);

      // < 60000
      var upperBoundOpenKeyRange = IDBKeyRange.upperBound(60000, true);

      // >= 60000 && < 80000
      var boundKeyRange = IDBKeyRange.bound(60000, 80000, false, true);

      // >= 60000 && <= 80000
      var boundKeyRange = IDBKeyRange.bound(60000, 80000, false, false);

      objectStore.openCursor(boundKeyRange).onsuccess = function(event) {
        var cursor = event.target.result;
        if(cursor) {
          users.push(cursor.value);
          cursor.continue();
        } else {
          console.log(users);
        }
      };
    };
  });
});

/*


index.openCursor(boundKeyRange).onsuccess = function(event) {
  var cursor = event.target.result;
  if (cursor) {
    // Do something with the matches.
    cursor.continue();
  }
};

// Descending order
objectStore.openCursor(null, IDBCursor.prev).onsuccess = function(event) {
  var cursor = event.target.result;
  if (cursor) {
    // Do something with the entries.
    cursor.continue();
  }
};

// Traverse unique keys in index
index.openKeyCursor(null, IDBCursor.nextunique).onsuccess = function(event) {
  var cursor = event.target.result;
  if (cursor) {
    // Do something with the entries.
    cursor.continue();
  }
};