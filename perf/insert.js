describe("bongo performance", function() {
  var a,db,id;

  it("defines a database", function() {
    db = bongo.db({
      name: 'acme',
      version: new Date("2012-12-12 12:12:16"),
      collections: ["users"]
    });

    expect((typeof db === 'undefined')).toBe(false);
    expect((typeof bongo.acme === 'undefined')).toBe(false);
  });

  var removeAllRecords = function() {
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
    }, "All records should be removed", 50000);

    runs(function() {
      expect(removed).toBe(true);
    });
  };

  describe("inserts",function() {
    beforeEach(removeAllRecords);
    afterEach(removeAllRecords);

    var total = 1000;
    it("inserts " + total + " records", function() {
      var inserted = 0;

      runs(function() {
        for(var x = 0;x < total;x++) {
          db.users.insert({
            name: Math.random(),
            email: Math.random() + "@domain.com"
          },function(error,resultId) {
            if(!error && resultId) {
              inserted++;
              if(!(inserted % (total / 2))) {
                console.log('Inserted ' + inserted + ' so far');
              }
            }
          });
        }
      });

      waitsFor(function() {
        return inserted >= total;
      }, "The record should be inserted", 30000);

      runs(function() {
        expect(inserted >= total).toBe(true);
      });
    });
  });
});