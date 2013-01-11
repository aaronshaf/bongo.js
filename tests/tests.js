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
  console.log(database);
  ok((typeof database) !== "undefined", "Passed!" );
});

/*
asyncTest("Get database", function() {
  stop();

  bongo.defineDatabase(testDatabase);
  console.log(bongo.test);
  bongo.test.then(function() {
    ok( true, "Passed and ready to resume!" );
    start();
  });
});
*/

asyncTest("Insert record", function() {
  //stop(2);

  db = bongo.defineDatabase(testDatabase);
  db.people.insert({
    name: "John Doe",
    email: "user@domain.com"
  }, function(error) {
    collection.count(function(err, count) {
      equal(1, count);
      start();
    });
  });
});

asyncTest("findOne record", function() {
  stop();

  bongo.defineDatabase(testDatabase);
  bongo.test.people.findOne({
    "_id": "123"
  },function(data) {
    ok(data._id);
    start();
  });
});