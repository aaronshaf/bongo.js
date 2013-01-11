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

  bongo.defineDatabase(testDatabase);
  bongo.test.people.insert({
    name: "John Doe",
    email: "user@domain.com"
  }, function(err, count) {
    collection.count(function(err, count) {
      equal(1, count);
      start();

    });

    collection.find().toArray(function(err, results) {
      equal(1, results.length);
      ok(results[0].a === 2);
      start();
      //client.close();
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