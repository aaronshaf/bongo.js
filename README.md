## Easy, peasy, lemon squeezy

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

### Find

```javascript
db.users.find({
  email: "john@domain.com"
}, function(error,results) {
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