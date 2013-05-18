describe("bongo", function() {
  var a,db,id;

  it("checks to see if browser supports IndexedDB", function() {
    expect(bongo.supported()).toBe(true);
  });

  it("defines a database", function() {
    db = bongo.db({
      name: 'acme',
      objectStores: ["users","employees"]
    });

    expect((typeof db === 'undefined')).toBe(false);
    expect((typeof bongo.acme === 'undefined')).toBe(false);
  });

  // it("probes a database", function() {
  //   var definition = null;

  //   bongo.probe('acme',function(result) {
  //     definition = result;
  //   });

  //   // waitsFor(function() {return definition;}, 200);

  //   // runs(function() {expect(JSON.stringify(definition)).
  //   //   toBe('{"name":"acme","objectStores":["employees","users"],"version":1}');
  //   // });
  // });

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
  return;

  it("saves a record", function() {
    var inserted = false;

    runs(function() {
      db.users.save({
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
      if(id) {
        bongo.acme.users.get(id,function(error,data) {
          if(!error && data) {
            fetched = true;
          }
        });
      }
    });

    waitsFor(function() {
      return fetched;
    }, "The record should be fetched", 200);

    runs(function() {
      expect(fetched).toBe(true);
    });
  });

  it("count records", function() {
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
      bongo.acme.users.find({}).toArray(function(error,results) {
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
    }, "The inserted record should be found", 500);

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

  it("filters (1)", function() {
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
    }, "Records should be filtered (1)", 200);

    runs(function() {
      expect(filtered).toBe(true);
    });
  });

  it("filters (2)", function() {
    var filtered = false;

    var query = new RegExp('jane','i');
    db.users.filter(function(doc) {
      return query.test(doc.email);
    }).toArray(function(error,results) {
      if(!error && results.length) {
        filtered = true;
      }
    });

    waitsFor(function() {
      return filtered;
    }, "Records should be filtered (2)", 200);

    runs(function() {
      expect(filtered).toBe(true);
    });
  });

  it("limit on find", function() {
    var limited = false;
    var resultCount = null;

    db.users.find({}).limit(2).toArray(function(error,results) {
      if(!error) {
        resultCount = results.length;
        limited = true;
      }
    });

    waitsFor(function() {
      return limited;
    }, "Records should be filtered (2)", 200);

    runs(function() {
      expect(resultCount).toBe(2);
    });
  });

  it("limit on filter", function() {
    var limited = false;
    var resultCount = null;

    db.users.filter(function() {
      return true;
    }).limit(2).toArray(function(error,results) {
      if(!error) {
        resultCount = results.length;
        limited = true;
      }
    });

    waitsFor(function() {
      return limited;
    }, "Records should be filtered (2)", 200);

    runs(function() {
      expect(resultCount).toBe(2);
    });
  });

  it("skip records", function() {
    // Forthcoming
  });

  it("use single index to speed up simple query", function() {
    // Forthcoming
  });

  it("find (1)", function() {
    var found = false;

    db.users.find({
      name: 'Jane Doe'
    }).toArray(function(error,results) {
      if(!error && results.length) {
        found = true;
      }
    });

    waitsFor(function() {
      return found;
    }, "Records should be found (1)", 200);

    runs(function() {
      expect(found).toBe(true);
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

  // it("deletes the database", function() {
  //   var deleted = false;

  //   runs(function() {
  //     db.delete(function() {
  //       deleted = true;
  //     });
  //   });

  //   waitsFor(function() {
  //     return deleted;
  //   }, "The database should be deleted", 20000);

  //   runs(function() {
  //     expect(deleted).toBe(true);
  //   });
  // });
});