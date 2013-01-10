asyncTest("defineDatabase", function() {
  expect(1);
 
  var testDatabase = {
    name: 'test',
    version: '2012-01-10 11:43:00',
    collections: [
      {
        name: 'people'
      }
    ]
  };

  bongo.defineDatabase(testDatabase).then(function() {
    ok( true, "Passed and ready to resume!" );
    start();
  });
});