describe("bongo", function() {
  var a,db,id;

  it("checks to see if browser supports IndexedDB", function() {
    expect(bongo.supported()).toBe(true);
  });

  it("defines a database", function() {
    db = bongo.db({
      name: 'acme',
      version: new Date("2012-12-12 12:12:16"),
      collections: ["users"]
    });

    expect((typeof db === 'undefined')).toBe(false);
    expect((typeof bongo.acme === 'undefined')).toBe(false);
  });

  it('can generate mongo-esque keys', function() {
    var key;

    for(var x = 0;x < 101;x++) {
      key = bongo.key();
      expect(typeof key === "string" && key.indexOf('NaN') === -1).toBe(true);
    }
  });

  it("inserts a record", function() {
    var inserted = false;

    runs(function() {
      db.users.insert({
        name: "John Doe",
        email: "john@domain.com"
      },function(error,resultId) {
        if(!error && resultId) {
          id = resultId;
          inserted = true;
        }
      });
    });

    waitsFor(function() {
      return inserted;
    }, "The record should be inserted", 200);

    runs(function() {
      expect(inserted).toBe(true);
    });
  });

  it("fetch a record", function() {
    var fetched = false;
    runs(function() {
      bongo.acme.users.get(id,function(error,data) {
        if(!error && data) {
          fetched = true;
        }
      });
    });

    waitsFor(function() {
      return fetched;
    }, "The record should be fetched", 200);

    runs(function() {
      expect(fetched).toBe(true);
    });
  });

  it("counts a record", function() {
    var count;

    runs(function() {
      db.users.count(function(response) {
        count = response;
      });
    });

    waitsFor(function() {
      return typeof count !== "undefined";
    }, "The records should be counted", 1000);

    runs(function() {
      expect(count > 0).toBe(true);
    });
  });

  it("find records by empty criteria", function() {
    var found = false;

    var insertRecord1 = function() {
      db.users.insert({
        name: "John Doe",
        email: "john@domain.com"
      },insertRecord2);
    };

    var insertRecord2 = function() {
      db.users.insert({
        name: "Jane Doe",
        email: "jane@domain.com"
      },findRecords);
    };

    var findRecords = function() {
      bongo.acme.users.find({},function(error,results) {
        if(!error && results && results.length) {
          found = true;
        }
      });
    };

    runs(function() {
      insertRecord1();
    });

    waitsFor(function() {
      return found;
    }, "The record should be found", 500);

    runs(function() {
      expect(found).toBe(true);
    });
  });

  it("removes a record", function() {
    var removed = false;
    runs(function() {
      bongo.acme.users.remove(id,function(error) {
        if(!error) {
          // This should attempt to find the particular record which was removed
          removed = true;
        }
      });
    });

    waitsFor(function() {
      return removed;
    }, "The record should be removed", 200);

    runs(function() {
      expect(removed).toBe(true);
    });
  });

  it("filters", function() {
    var filtered = false;

    bongo.acme.users
      .filter(function(doc) {
        return doc.name === "Jane Doe";
      })
      .toArray(function(error, results) {
        if(!error && results.length) {
          filtered = true;
        }
      });

    waitsFor(function() {
      return filtered;
    }, "Records should be filtered", 200);

    runs(function() {
      expect(filtered).toBe(true);
    });
  });

  // it("picks fields", function() {
  // });

  it("remove all records", function() {
    var removed = false;
    runs(function() {
      bongo.acme.users.remove({},function(error) {
        if(!error) {
          removed = true;
        }
      });
    });

    waitsFor(function() {
      return removed;
    }, "All records should be removed", 200);

    runs(function() {
      expect(removed).toBe(true);
    });
  });

  /*
  it("deletes the database", function() {
    var deleted = false;

    runs(function() {
      db.delete(function() {
        deleted = true;
      });
    });

    waitsFor(function() {
      return deleted;
    }, "The database should be deleted", 10000);

    runs(function() {
      expect(deleted).toBe(true);
    });
  });
  */
});