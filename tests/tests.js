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

test('Define database',function() {
  var database = bongo.defineDatabase(testDatabase);
  ok((typeof database) !== "undefined", "Passed!" );
});

asyncTest("Insert", function() {
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
  expect(1);

  db = bongo.defineDatabase(testDatabase);
  db.people.count(function(error, count) {
    ok(!error && count === 1);
    start();
  });
});

/*
asyncTest("findOne", function() {
  expect(1);

  bongo.defineDatabase(testDatabase);
  bongo.test.people.findOne({
    "name": "John Doe"
  },function(error,data) {
    console.log(data);
    ok(!error && data && data._id);
    start();
  });
});
*/

asyncTest("remove", function() {
  expect(1);
  var id;

  bongo.defineDatabase(testDatabase);

  bongo.test.people.insert({
    "name": "Jane Doe"
  },function(error,data) {
    ok(!error && data && data._id);
    id = data._id;

    bongo.test.people.remove(id,function(error) {
      ok(!error);
      start();
    });
  });


});