## Easy, peasy, lemon squeezy

### Define database

```javascript
var db = bongo.defineDatabase({
  name: 'acme',
  version: new Date("2012-12-12 01:13:01"),
  collections: [
    {
      name: 'people'
    }
  ]
});
```

### Insert

```javascript
db.people.insert({
  name: "John Doe",
  email: "john@domain.com"
});
```

### findOne

```javascript
db.people.findOne({
  email: "john@domain.com"
}, function(error,data) {
  if(!error) {
    //success
  }
});
```

### Remove

```javascript
db.people.remove({
  email: "john@domain.com"
}, function(error, data) {
  if(!error) {
    //success
  }
});
```

Or just use the ID:


```javascript
db.people.remove("12345", function(error, data) {
  if(!error) {
    //success
  }
});
```

## License

MIT
