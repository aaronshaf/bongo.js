//Mimic examples from https://github.com/mongodb/node-mongodb-native ?

var testDatabase = {
  name: 'test',
  version: new Date(), //new Date("2012-12-12 11:13:01"),
  collections: [
    {
      name: 'people'
    }
  ]
};

test('db',function() {
  var database = bongo.defineDatabase(testDatabase);
  ok((typeof database) !== "undefined", "Passed!" );
});

asyncTest("insert", function() {
  expect(1);

  db = bongo.defineDatabase(testDatabase);
  db.people.insert({
    name: "John Doe",
    email: "user@domain.com"
  }, function(error,id) {
    ok(!error && id);
    start();
  });
});

asyncTest("count", function() {
  expect(2);

  db = bongo.defineDatabase(testDatabase);
  db.people.insert({
    name: "Bobby Doe",
    email: "user@domain.com"
  }, function(error,id) {
    ok(!error && id);
    stop();

    db.people.count(function(error, count) {
      ok(!error && count > 0);
      start(2);
    });
  });
});

asyncTest("get", function() {
  expect(2);

  bongo.defineDatabase(testDatabase);
  bongo.test.people.insert({
    "name": "James Doe"
  },function(error,id) {
    ok(!error && id);
    bongo.test.people.get(id,function(error,data) {
      ok(!error && data && data._id);
      start();
    });
  });
});

asyncTest("remove", function() {
  expect(3);
  var id;

  bongo.defineDatabase(testDatabase);

  bongo.test.people.insert({
    "name": "Jane Doe"
  },function(error,id) {
    ok(!error && id);
    bongo.test.people.remove(id,function(error) {
      ok(!error);

      bongo.test.people.get(id,function(error,data) {
        ok(typeof data === "undefined");
        start();
      });
    });
  });
});