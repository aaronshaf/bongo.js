## Easy, peasy, lemon squeezy

Tested in Chrome 26, Chrome 29, and Firefox 22.

### Check for support

```javascript
if(bongo.supported) {
  // Woo hoo!
}
```

### Define database

```javascript
var db = bongo.db({
  name: 'acme',
  objectStores: ["users"]
});
```

### Access database

```javascript
var db = bongo.acme;
```

### insert

```javascript
db.users.insert({
  name: "John Doe",
  email: "john@domain.com"
});
```

### save

```javascript
db.users.save({
  _id: "[key]", //optional
  name: "John Doe",
  email: "john@domain.com"
});
```

### get

```javascript
db.users.get("[key]", function(error,data) {
  if(!error) {
    //success
  }
});
```

### find

```javascript
db.users.find({
  name: "John Doe"
}).toArray(function(error,results) {
    if(!error) {
      //success
    }
  });
```

### findOne

```javascript
db.users.findOne({
  name: "John Doe"
}),function(error,record) {
    if(!error) {
      //success
    }
  });
```

### filter

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

### pick
```javascript
db.users.filter(function(doc) {
  return doc.age > 30;
}).pick(['name','email']).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

### limit
```javascript
db.users.filter(function(doc) {
  return doc.age > 30;
}).limit(5).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

### skip
```javascript
db.users.filter(function(doc) {
  return doc.age > 30;
}).skip(5).limit(5).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

### remove

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
* [linq2indexeddb](http://linq2indexeddb.codeplex.com/)
* [ytkyaw/ydn-db](https://github.com/yathit/ydn-db/blob/master/js/ydn/db/conn/indexed_db.js) (adapter)
* [brianleroux/lawnchair](https://github.com/brianleroux/lawnchair/blob/master/src/adapters/indexed-db.js) (adapter)
* [daleharvey/pouchdb](https://github.com/daleharvey/pouchdb/blob/master/src/adapters/pouch.idb.js) (adapter)
* [facebook / IndexedDB-polyfill](https://github.com/facebook/IndexedDB-polyfill) (polyfill)