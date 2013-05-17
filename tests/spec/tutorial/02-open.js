var version = null;

describe("IndexedDB", function() {
  it("opens a database", function() {
    var opened = false;
    var db = {};
    var request = window.indexedDB.open('MyDatabase');

    request.onsuccess = function(event) {
      db = request.result;
      console.info('Database',request.result);
      opened = true;
      db.close();
    };

    request.onblocked = function(event) {
      // Most common error: Version on disk is greater

      // "Error events are targeted at the request
      // that generated the error, then the event
      // bubbles to the transaction, and then
      // finally to the database object." (MDN)
    };

    // Tip:
    // var request = window.indexedDB.webkitGetDatabaseNames();

    waitsFor(function() {return opened;}, 200);

    runs(function() {
      expect(request.result.name).toBe('MyDatabase');
    });
  });

  it("gets current version", function() {
    var request = window.indexedDB.open('MyDatabase');

    request.onsuccess = function(event) {
      version = request.result.version;
      console.info('Current version:',version);
    };
    waitsFor(function() {return version;}, 200);
    runs(function() {
      expect(version > 0).toBe(true);
    });
  });

  /*
  Same origin:
    "IndexedDB follows a same-origin policy. So while you
    can access stored data within a domain, you cannot
    access data across different domains." (MDN)
    Can't test on file://

  Asynchronous with callbacks
    "The API doesn't give you data by returning values; instead,
    you have to pass a callback function." (MDN)

  Using addEventListener breaks polyfill
    request.addEventListener('success',function(event) { ... });
    request.onsuccess = function(event) {...}

  Why versions?
    "Versions are intended to allow authors to manage schema
    changes incrementally and non-destructively, and without
    running the risk of old code (e.g. in another browser window)
    trying to write to a database with incorrect assumptions."
   - http://www.whatwg.org/specs/web-apps/2007-10-26/multipage/section-sql.html
  */  
});