// " IndexedDB was actually designed so a more user
// friendly or extended wrapper library could be
// “layered” on top of the API to add various features
// or functionality"

// Wrappers

// http://github.com/aaronpowell/db.js
// http://github.com/jensarps/IDBWrapper
// http://github.com/axemclion/IndexedDB
// http://github.com/grgrssll/IndexedDB
// http://github.com/aaronshaf/bongo
// http://pouchdb.com/

// Bongo

var db = bongo.db({
  name: 'acme',
  version: new Date("2012-12-12 12:12:12"),
  collections: ["users"]
});

db.users.insert({
  name: "John Doe",
  email: "john@domain.com"
});

db.users.filter(function(doc) {
  return doc.age > 30;
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});