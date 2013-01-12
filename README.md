[![Build Status](https://secure.travis-ci.org/aaronshaf/bongo.png)](http://travis-ci.org/aaronshaf/bongo)

## Easy, peasy, lemon squeezy

### Define database

```javascript
var db = bongo.db("acme",["users","products"]);
```

Or be more specific:

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

### Get

```javascript
db.users.get({
  email: "john@domain.com"
}, function(error,data) {
  if(!error) {
    //success
  }
});
```

Or just use the key:


```javascript
db.users.get("[key]", function(error,data) {
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
});
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
