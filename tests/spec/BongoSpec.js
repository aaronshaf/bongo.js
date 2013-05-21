var assert = chai.assert;
var schema = {
  name: 'acme',
  objectStores: ["users","employees"]
};

describe("bongo", function() {
  var a,db,id;

  it("checks to see if browser supports IndexedDB", function() {
    assert.equal(bongo.supported,true);
  });

  it('can generate mongo-esque keys', function() {
    var key;

    for(var x = 0;x < 101;x++) {
      key = bongo.key();
      assert.equal(typeof key === "string" && key.indexOf('NaN') === -1,true);
    }
  });

  describe("Database", function() {
    describe("#db", function() {
      it("defines a database", function(done) {
        this.timeout(30000);

        db = bongo.db(schema,function() {
          assert.notTypeOf(db,'undefined');
          assert.notTypeOf(bongo.acme,'undefined');
          done();
        });
      });

      /*
      it("redefines a database without error", function(done) {
        this.timeout(30000);

        db = bongo.db({
          name: 'acme',
          objectStores: ["animals"]
        },function() {
          assert.notTypeOf(db,'undefined');
          assert.notTypeOf(bongo.acme,'undefined');
          done();
        });
      });

      it("redefines it yet again", function(done) {
        this.timeout(30000);

        db = bongo.db(schema,function() {
          assert.notTypeOf(db,'undefined');
          assert.notTypeOf(bongo.acme,'undefined');
          done();
        });
      });
      */
    });

    describe("#getStoredSignature", function() {
      it("probes a database", function(done) {
        this.timeout(30000);
        var definition = null;

        bongo.getStoredSignature('acme',function(signature) {
          assert.equal(signature.name,'acme');
          assert.equal(Object.keys(signature.objectStores).length,schema.objectStores.length);
          done();
        });
      });
    });
  });

  describe("ObjectStore", function() {
    describe("#insert", function() {
      it("inserts a record without error", function(done) {
        db.users.insert({
          name: "John Doe",
          email: "john@domain.com"
        },function(error,resultId) {
          if(!error && resultId) {
            done();
          }
        });
      });
    });

    describe("#count",function() {
      it("count records", function(done) {
        db.users.count(function(response) {
          if(response > 0) {
            done();
          }
        });
      });
    });

    describe("#save", function() {
      it("saves a record without error", function(done) {
        db.users.save({
          _id: '12345',
          name: "John Doe",
          email: "john@domain.com"
        },function(error,resultId) {
          if(!error && resultId) {
            id = resultId;
            done();
          }
        });
      });
    });

    describe("#get", function() {
      it("fetch a record", function(done) {
        bongo.acme.users.get('12345',function(error,data) {
          if(!error && data) {
            done();
          }
        });
      });
    });
  });

  describe("Query", function() {
    describe("#findOne", function() {
      it("finds one record", function(done) {
        db.users.findOne({},function(error,record) {
          if(!error && record) {
            done();
          }
        });
      });
    });

    describe("#limit", function() {
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
    });

    describe("#find", function() {
      it("find records with empty criteria", function(done) {
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

      it("find records with string-value criteria", function(done) {
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

      it("find records with RegExp criteria", function(done) {
        var found = false;

        db.users.find({
          name: /jane/i
        }).toArray(function(error,results) {
          if(!error && results.length) {
            found = true;
            done();
          }
        });
      });
    });

    describe("#filter", function() {
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
    });

    // it("skip records", function() {});
    // it("picks fields", function() {});
  });

  describe("ObjectStore (2)", function() {

    describe("#remove", function() {
      it("removes a record without error", function(done) {
        bongo.acme.users.remove(id,function(error) {
          if(!error) {
            done();
          }
        });
      });

      it("remove all records without error", function(done) {
        bongo.acme.users.remove({},function(error) {
          if(!error) {
            done();
          }
        });
      });
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