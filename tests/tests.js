//Mimic examples from https://github.com/mongodb/node-mongodb-native ?

var testDatabase = {
  name: 'test',
  //version: new Date(), //new Date("2012-12-12 11:13:01"),
  collections: ['people']
};

test('db', function() {
  expect(2);

  var database = bongo.db(testDatabase);
  ok((typeof database) !== "undefined");

  var database = bongo.db('test',['people']);
  ok((typeof database) !== "undefined", "Alternative");
});

test('default key generator', function() {
  var key;

  for(var x = 0;x < 101;x++) {
    key = bongo.key();
    ok(typeof key === "string" && key.indexOf('NaN') === -1);
  }
});

asyncTest("insert", function() {
  expect(1);

  db = bongo.db(testDatabase);
  db.people.insert({
    name: "John Doe",
    email: "user@domain.com"
  }, function(error,id) {
    ok(!error && id);
    start();
  });
});

asyncTest("save", function() {
  expect(2);

  db = bongo.db(testDatabase);
  db.people.save({
    name: "John Doe",
    email: "user@domain.com"
  }, function(error,ids) {
    ok(!error && ids.length === 1,"Save one new records");
  });

  db.people.save([
      {
        name: "John Doe",
        email: "user@domain.com"
      },
      {
        name: "Jane Doe",
        email: "user@domain.com"
      }
    ], function(error,ids) {
    ok(!error && ids.length === 2,"Save multiple new records");
    start();
  });
});

asyncTest("count", function() {
  expect(2);

  db = bongo.db(testDatabase);
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

  bongo.db(testDatabase);
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

  bongo.db(testDatabase);

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

asyncTest("find", function() {
  expect(2);

  bongo.db(testDatabase);

  bongo.test.people.find({},function(error,data) {
    ok(!error && data.length, 'No criteria');
  });

  bongo.test.people.count(function(error, count) {
    bongo.test.people.find({name: "Bobby Doe"},function(error,data) {
      ok(!error && data.length < count, 'Find with simple criteria');
      start();
    });
  });
});