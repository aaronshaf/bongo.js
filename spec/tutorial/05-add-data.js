describe("IndexedDB", function() {
  it("inserts data", function() {
    var dbRequest = window.indexedDB.open('MyDatabase');
    dbRequest.onsuccess = function() {
      db = dbRequest.result;
      var objectStoresToSpan = ['users'];
      var transactionType = 'readwrite'; //readonly, readwrite, versionchange
      var transaction = db.transaction(objectStoresToSpan, transactionType);
      var objectStore = transaction.objectStore("users");
      // Add with implied key

      objectStore.clear();

      for(var x = 0;x < 10;x++) {
        var request1 = objectStore.add({
          name: 'John Doe',
          email: 'johndoe.' + Math.random() +'@domain.com'
        });        
      }

      // objectStore.add
      // objectStore.count
      // objectStore.clear

      console.log(request1);

      // Add with specified key
      // var request2 = objectStore.add({
      //   name: 'Jane Doe',
      //   email: 'janedoe@domain.com'
      // },'123');
    };

    // "Transactions auto-commit and cannot be committed manually." (MDN)
    // Unused transactions go inactive upon return to event loop
  });

  /*
  Firefox
    "No limit on the IndexedDB database's size"
    https://developer.mozilla.org/en-US/docs/IndexedDB#Storage_limits
    
  Chrome
    "Temporary storage is shared among all web apps running in the browser. The shared pool can be up to half of the of available disk space. Storage already used by apps is included in the calculation of the shared pool; that is to say, the calculation is based on (available storage space + storage being used by apps) * .5 . Each app can have up to 20% of the shared pool. As an example, if the total available disk space is 50 GB, the shared pool is 25 GB, and the app can have up to 5 GB. This is calculated from 20% (up to 5 GB) of half (up to 25 GB) of the available disk space (50 GB)."
    https://developers.google.com/chrome/whitepapers/storage#temporary

  Safari
    Asks for permission over 10mb

  IE
    Asks for permission over 10mb
    Capped at 250mb?
    http://stackoverflow.com/questions/14717739/storage-limit-for-indexeddb-on-ie10

  Tools for managing IDB data suck.
  */
});