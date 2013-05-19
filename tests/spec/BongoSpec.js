assert = chai.assert;

describe("bongo", function() {
  var a,db,id;

  it("checks to see if browser supports IndexedDB", function() {
    assert.equal(bongo.supported(),true);
  });

  it("defines a database", function() {
    db = bongo.db({
      name: 'acme',
      objectStores: ["users","employees"]
    });

    assert.equal((typeof db === 'undefined'),false);
    assert.equal((typeof bongo.acme === 'undefined'),false);
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
      assert.equal(typeof key === "string" && key.indexOf('NaN') === -1,true);
    }
  });

  it("inserts a record without error", function(done) {
    db.users.insert({
      name: "John Doe",
      email: "john@domain.com"
    },function(error,resultId) {
      if(!error && resultId) {
        id = resultId;
        done();
      }
    });
  });

  it("saves a record without error", function(done) {
    db.users.save({
      name: "John Doe",
      email: "john@domain.com"
    },function(error,resultId) {
      if(!error && resultId) {
        id = resultId;
        done();
      }
    });
  });

  it("fetch a record", function(done) {
    if(id) {
      bongo.acme.users.get(id,function(error,data) {
        if(!error && data) {
          done();
        }
      });
    }
  });

  it("count records", function(done) {
    db.users.count(function(response) {
      if(response > 0) {
        done();
      }
    });
  });

  it("find records by empty criteria", function(done) {
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
          done();
        }
      });
    };

    insertRecord1();
  });

  it("removes a record without error", function(done) {
    bongo.acme.users.remove(id,function(error) {
      if(!error) {
        done();
      }
    });
  });

  it("filters (1)", function(done) {
    bongo.acme.users
      .filter(function(doc) {
        return doc.name === "Jane Doe";
      })
      .toArray(function(error, results) {
        if(!error && results.length) {
          done();
        }
      });
  });

  it("filters (2)", function(done) {
    var query = new RegExp('jane','i');
    db.users.filter(function(doc) {
      return query.test(doc.email);
    }).toArray(function(error,results) {
      if(!error && results.length) {
        done();
      }
    });
  });

  it("limit on find", function(done) {
    db.users.find({}).limit(2).toArray(function(error,results) {
      if(!error) {
        if(results.length == 2) {
          done();
        }
      }
    });
  });

  it("limit on filter", function(done) {
    db.users.filter(function() {
      return true;
    }).limit(2).toArray(function(error,results) {
      if(!error) {
        if(results.length === 2) {
          done();
        }
      }
    });
  });

  it("skip records", function() {
    // Forthcoming
  });

  it("use single index to speed up simple query", function() {
    // Forthcoming
  });

  it("find (1)", function(done) {
    var found = false;

    db.users.find({
      name: 'Jane Doe'
    }).toArray(function(error,results) {
      if(!error && results.length) {
        found = true;
        done();
      }
    });
  });

  // it("picks fields", function() {
  // });

  it("remove all records without error", function(done) {
    bongo.acme.users.remove({},function(error) {
      if(!error) {
        done();
      }
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