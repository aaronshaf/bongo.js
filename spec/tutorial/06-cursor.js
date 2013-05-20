describe("IndexedDB", function() {
  it("uses cursor", function() {
    var dbRequest = window.indexedDB.open('MyDatabase');
    dbRequest.onsuccess = function(event) {
      var db = dbRequest.result;
      var objectStore = db.transaction("users").objectStore("users");

      // Common pattern
      var users = [];
      objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if(cursor) {
          users.push(cursor.value);
          cursor.continue();
        } else {
          console.log(users);
        }
      };

      // To reverse direction
      // objectStore.openCursor(null, IDBCursor.prev).onsuccess = function(event) {
    };
  });
});