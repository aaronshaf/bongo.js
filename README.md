## Easy, peasy, lemon squeezy

Bongo.js is a library for storing and querying structured data on the browser. Lots of it.

It is built on [IndexedDB](http://en.wikipedia.org/wiki/Indexed_Database_API).

It has been [tested](http://aaronshaf.github.io/bongo.js/) in Chrome 26, Chrome 29, Firefox 22, and Internet Explorer 10.

## Features

* Automatic versioning and database upgrades
* Custom filters
* Comparison query operators ($all, $lt, $lte, $gt, $gte, $in, $nin)
* Insert, save, remove, find, findOne
* Pick, limit, skip

## Get started

#### Check for support

```javascript
if(bongo.supported) {
  // Woo hoo!
}
```

#### Define database

```javascript
bongo.db({
  name: 'acme',
  objectStores: ["users"]
});
```

#### insert

```javascript
bongo.users.insert({
  name: "John Doe",
  email: "john@domain.com"
});
```

#### save

```javascript
bongo.users.save({
  _id: "[key]", //optional
  name: "Jane Doe",
  email: "jane@domain.com",
  pets: 3
});
```

#### get

```javascript
bongo.users.get("[key]", function(error,data) {
  if(!error) {
    //success
  }
});
```

#### find

```javascript
bongo.users.find({
  name: "John Doe"
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

##### Regular expressions

```javascript
bongo.users.find({
  name: /john/i
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

##### Comparison query operators

```javascript
bongo.users.find({
  pets: {$gt: 2}
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

$all, $lt, $lte, $gt, $gte, $in, $nin are supported.

#### findOne

```javascript
bongo.users.findOne({
  name: "John Doe"
}),function(error,record) {
  if(!error) {
    //success
  }
});
```

#### filter

```javascript
bongo.users.filter(function(doc) {
  return doc.age > 30;
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

```javascript
var query = new RegExp('john','i');
bongo.users.filter(function(doc) {
  return query.test(doc.name);
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

#### pick
```javascript
bongo.users.filter(function(doc) {
  return doc.age > 30;
}).pick(['name','email']).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

#### limit
```javascript
bongo.users.filter(function(doc) {
  return doc.age > 30;
}).limit(5).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

#### skip
```javascript
bongo.users.filter(function(doc) {
  return doc.age > 30;
}).skip(5).limit(5).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

#### remove

```javascript
bongo.users.remove({
  email: "john@domain.com"
}, function(error, data) {
  if(!error) {
    //success
  }
})
```

Or just use the key:

```javascript
bongo.users.remove("[key]", function(error, data) {
  if(!error) {
    //success
  }
});
```

#### Delete the database

```javascript
bongo.delete(function(error) {
  if(!error) {
    // Success
  }
});
```

## Known issue

* After many(?) database upgrades, sometimes Chrome needs to be restarted.

## License

[MIT](http://en.wikipedia.org/wiki/MIT_License). Forking is form of flattery.

## See also

* [Introduction to Bongo.js](http://slid.es/aaronshaf/bongojs/fullscreen) (slides)
* [aaronpowell/bongo.js](https://github.com/aaronpowell/bongo.js)
* [jensarps/IDBWrapper](https://github.com/jensarps/IDBWrapper)
* [axemclion/IndexedDB](https://github.com/axemclion/IndexedDB)
* [grgrssll/IndexedDB](https://github.com/grgrssll/IndexedDB)
* [linq2indexeddb](http://linq2indexedbongo.codeplex.com/)
* [ytkyaw/ydn-db](https://github.com/yathit/ydn-db/blob/master/js/ydn/db/conn/indexed_bongo.js) (adapter)
* [brianleroux/lawnchair](https://github.com/brianleroux/lawnchair/blob/master/src/adapters/indexed-bongo.js) (adapter)
* [daleharvey/pouchdb](https://github.com/daleharvey/pouchdb/blob/master/src/adapters/pouch.ibongo.js) (adapter)
* [facebook/IndexedDB-polyfill](https://github.com/facebook/IndexedDB-polyfill) (polyfill)
* [axemclion/IndexedDBShim](https://github.com/axemclion/IndexedDBShim) (polyfill)
* [Parashuram's IndexedDB Experiments] (http://nparashuram.com/IndexedDB/)