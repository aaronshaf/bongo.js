Easy, peasy, lemon squeezy:

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

```javascript
db.people.insert({
  name: "John Doe",
  email: "john@domain.com"
});
```

```javascript
db.people.findOne({
  email: "john@domain.com"
}, function(error,data) {
  console.log(data);
});
```

## License

MIT
