## Easy, peasy, lemon squeezy

Tested in Chrome 26, Chrome 28, Firefox 21, Opera 12.15, Safari 6 (with shim), and IE 10.

### Define database

```javascript
var db = bongo.db({
  name: 'acme',
  version: new Date("2012-12-12 12:12:12"),
  collections: ["users"]
});
```

### Access database

```javascript
var db = bongo.acme;
```

### Insert

```javascript
db.users.insert({
  name: "John Doe",
  email: "john@domain.com"
});
```

### Save

```javascript
db.users.save({
  _id: "[key]", //optional
  name: "John Doe",
  email: "john@domain.com"
});
```

### Get

```javascript
db.users.get("[key]", function(error,data) {
  if(!error) {
    //success
  }
});
```

### Filter (find)

```javascript
db.users.filter(function(doc) {
  return doc.age > 30;
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

```javascript
var query = new RegExp('john','i');
db.users.filter(function(doc) {
  return query.test(doc.name);
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

### Pick fields
```javascript
db.users.filter(function(doc) {
  return doc.age > 30;
}).pick(['name','email']).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

### Remove

```javascript
db.users.remove({
  email: "john@domain.com"
}, function(error, data) {
  if(!error) {
    //success
  }
})
```

Or just use the key:

```javascript
db.users.remove("[key]", function(error, data) {
  if(!error) {
    //success
  }
});
```

## License

MIT

## See also

* [aaronpowell/db.js](https://github.com/aaronpowell/db.js)
* [jensarps/IDBWrapper](https://github.com/jensarps/IDBWrapper)
* [axemclion/IndexedDB](https://github.com/axemclion/IndexedDB)
* [grgrssll/IndexedDB](https://github.com/grgrssll/IndexedDB)
* [brianleroux/lawnchair](https://github.com/brianleroux/lawnchair/blob/master/src/adapters/indexed-db.js) (adapter)
* [daleharvey/pouchdb](https://github.com/daleharvey/pouchdb/blob/master/src/adapters/pouch.idb.js) (adapter)