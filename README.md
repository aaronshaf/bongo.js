## Easy, peasy, lemon squeezy

Tested in Chrome 26, Chrome 29, Firefox 22, and IE 10.

### Define database

```javascript
var db = bongo.db({
  name: 'acme',
  objectStores: ["users"]
});
```

### Check for support

```javascript
var supported = bongo.supported();
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

### Find

```javascript
db.users.find({
  name: "John Doe"
}).toArray(function(error,results) {
    if(!error) {
      //success
    }
  });
```

### Filter

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

### Limit results
```javascript
db.users.filter(function(doc) {
  return doc.age > 30;
}).limit(5).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

### Skip results
```javascript
db.users.filter(function(doc) {
  return doc.age > 30;
}).skip(5).limit(5).toArray(function(error,results) {
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

### Delete the database

```javascript
db.delete(function(error) {
  if(!error) {
    // Success
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