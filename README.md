# Bongo.js

Bongo.js is a JavaScript library for storing and querying structured data on the browser. Lots of it.

It is built on [IndexedDB](http://en.wikipedia.org/wiki/Indexed_Database_API).

It is [tested](http://aaronshaf.github.io/bongo.js/) in Chrome 27, Chrome 29, Firefox 22, and Internet Explorer 10.

## Features

* Insert, save, remove, find, findOne
* Comparison query operators ($all, $lt, $lte, $gt, $gte, $in, $nin)
* Mongo-esque key generator (on _id)
* Pick, limit, skip
* Automatic versioning and database upgrades
* Custom filters
* 11k

## Get started

### Install

Use [Bower](https://github.com/bower/bower):
```
bower install bongo.js
```
And include the file in your app:

```html
<script src='/components/bongo.js/dist/bongo.min.js'></script>
```

You can also [download the compressed, production version](https://raw.github.com/aaronshaf/bongo.js/master/dist/bongo.min.js) or the [uncompressed, development version](https://raw.github.com/aaronshaf/bongo.js/master/src/js/bongo.es5.js).

### Define database

```javascript
bongo.db({
  name: 'acme',
  collections: ["users"]
});
```

### insert

```javascript
bongo.db('acme').collection('users').insert({
  name: "John Doe",
  email: "john@domain.com"
},function(error,id) {
  if(!error) {
    // success
  }
}
});
```

### save

```javascript
bongo.db('acme').collection('users').save({
  _id: "[key]", //optional
  name: "Jane Doe",
  email: "jane@domain.com",
  pets: 3
});
```

### get

```javascript
bongo.db('acme').collection('users').get("[key]", function(error,data) {
  if(!error) {
    //success
  }
});
```

### find

```javascript
bongo.db('acme').collection('users').find({
  name: "John Doe"
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

#### Regular expressions

```javascript
bongo.db('acme').collection('users').find({
  name: /john/i
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

#### Comparison query operators

```javascript
bongo.db('acme').collection('users').find({
  pets: {$gt: 2}
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

$all, $lt, $lte, $gt, $gte, $in, $nin are supported.

### findOne

```javascript
bongo.db('acme').collection('users').findOne({
  name: "John Doe"
}),function(error,record) {
  if(!error) {
    //success
  }
});
```

### filter

```javascript
bongo.db('acme').collection('users').filter(function(doc) {
  return doc.age > 30;
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

### fields
```javascript
bongo.db('acme').collection('users').find({
  age: {$gt: 30}
},{
  name: 1,
  email: 1
}).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

or

```javascript
bongo.db('acme').collection('users').find({
  age: {$gt: 30}
}).pick(['name','email']).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

### limit
```javascript
bongo.db('acme').collection('users').find({
  age: {$gt: 30}
}).limit(5).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

### skip
```javascript
bongo.db('acme').collection('users').find({
  age: {$gt: 30}
}).skip(5).limit(5).toArray(function(error,results) {
  if(!error) {
    //success
  }
});
```

### remove

```javascript
bongo.db('acme').collection('users').remove({
  email: "john@domain.com"
}, function(error, data) {
  if(!error) {
    //success
  }
})
```

Or just use the key:

```javascript
bongo.db('acme').collection('users').remove("[key]", function(error, data) {
  if(!error) {
    //success
  }
});
```

### Delete the database

```javascript
bongo.delete(function(error) {
  if(!error) {
    // Success
  }
});
```

### Check for support

```javascript
if(bongo.supported) {
  // Woo hoo!
}
```

## Known issue

* After many(?) database version upgrades, sometimes Chrome needs to be restarted.
* Redefining the same database multiple times in the same pageload is problematic.

## License

[MIT](http://en.wikipedia.org/wiki/MIT_License). Forking is form of flattery.

## See also

* [Introduction to Bongo.js](http://slid.es/aaronshaf/bongojs/fullscreen) (slides)
* [aaronpowell/db.js](https://github.com/aaronpowell/db.js)
* [maxogden/level.js](https://github.com/maxogden/level.js)
* [jensarps/IDBWrapper](https://github.com/jensarps/IDBWrapper)
* [axemclion/IndexedDB](https://github.com/axemclion/IndexedDB)
* [grgrssll/IndexedDB](https://github.com/grgrssll/IndexedDB)
* [ironfroggy/plasmid](https://github.com/ironfroggy/plasmid)
* [malucomarinero/johodb] (http://malucomarinero.bitbucket.org/johodb/)
* [linq2indexeddb](http://linq2indexeddb.codeplex.com/)
* [mozilla-b2g/gaia/async_storage.js](https://github.com/mozilla-b2g/gaia/blob/master/shared/js/async_storage.js)
* [ytkyaw/ydn-db](https://github.com/yathit/ydn-db/blob/master/js/ydn/db/conn/indexed_bongo.js) (adapter)
* [brianleroux/lawnchair](https://github.com/brianleroux/lawnchair/blob/master/src/adapters/indexed-bongo.js) (adapter)
* [daleharvey/pouchdb](https://github.com/daleharvey/pouchdb/blob/master/src/adapters/pouch.ibongo.js) (adapter)
* [facebook/IndexedDB-polyfill](https://github.com/facebook/IndexedDB-polyfill) (polyfill)
* [axemclion/IndexedDBShim](https://github.com/axemclion/IndexedDBShim) (polyfill)
* [Parashuram's IndexedDB Experiments] (http://nparashuram.com/IndexedDB/)