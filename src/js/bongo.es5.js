var bongo;
(function (bongo) {
    var Database = (function () {
        function Database(definition, callback) {
            if (typeof callback === "undefined") { callback = function () {
            }; }
            this.ensured = false;
            this.objectStores = [];
            definition.objectStores = definition.objectStores || definition.collections || [];
            this.name = definition.name;
            for(var x = 0; x < definition.objectStores.length; x++) {
                if (typeof definition.objectStores[x] === 'string') {
                    definition.objectStores[x] = {
                        name: definition.objectStores[x]
                    };
                }
                ;
                var objectStore = new bongo.ObjectStore(this, definition.objectStores[x]);
                this[objectStore.name] = objectStore;
                this.objectStores.push(objectStore);
            }
            this.ensure(callback);
        }
        Database.prototype.collection = function (name) {
            return this[name];
        };
        Database.prototype.objectStore = function (name) {
            return this[name];
        };
        Database.prototype.signature = function () {
            var objectStores = {};
            this.objectStores.forEach(function (objectStore) {
                objectStores[objectStore.name] = {
                    autoIncrement: objectStore.autoIncrement,
                    indexes: objectStore.indexes,
                    keyPath: objectStore.keyPath,
                    name: objectStore.name
                };
            });
            return {
                name: this.name,
                objectStores: objectStores
            };
        };
        Database.prototype.delete = function (callback) {
            if (typeof callback === "undefined") { callback = function () {
            }; }
            var _this = this;
            var tries = 0;
            for(var x = 0; x < this.objectStores.length; x++) {
                delete this[this.objectStores[x].name];
            }
            delete this.objectStores;
            var tryToDelete = function () {
                var request = bongo.indexedDB.deleteDatabase(_this.name);
                request.onsuccess = function (event) {
                    callback();
                }.bind(_this);
                request.onblocked = function (event) {
                    if (tries < 40) {
                        setTimeout(function () {
                            tryToDelete();
                            tries++;
                        }, 250);
                    } else {
                        throw request.webkitErrorMessage || request.error.name;
                    }
                }.bind(_this);
                request.onerror = function (event) {
                    throw request.webkitErrorMessage || request.error.name;
                }.bind(_this);
            };
            this.get(function (database) {
                database.close();
                tryToDelete();
            });
        };
        Database.prototype.get = function (callback) {
            var _this = this;
            var tries = 500;
            var tryToOpen = function () {
                if (!_this.ensured) {
                    if (bongo.debug) {
                        console.log('Database not ensured yet');
                    }
                    tries--;
                    if (tries > 0) {
                        setTimeout(function () {
                            tryToOpen();
                        }, 200);
                    }
                    return;
                }
                if (bongo.debug) {
                    console.log('Database is ensured');
                }
                var request = bongo.indexedDB.open(_this.name);
                request.onupgradeneeded = function (event) {
                    if (bongo.debug) {
                        console.debug('onupgradeneeded');
                    }
                    var db = request.result;
                    db.close();
                };
                request.onsuccess = function (event) {
                    if (bongo.debug) {
                        console.debug('onsuccess');
                    }
                    callback(event.target.result);
                };
                request.onblocked = function (event) {
                    console.log(_this.version, request);
                    console.log('onblocked');
                    throw request.webkitErrorMessage || request.error.name;
                };
                request.onerror = function (event) {
                    console.log('onerror');
                    throw request.webkitErrorMessage || request.error.name;
                };
                request.onfailure = request.onerror;
            };
            tryToOpen();
        };
        Database.prototype.ensure = function (callback) {
            if (typeof callback === "undefined") { callback = function () {
            }; }
            var _this = this;
            if (bongo.debug) {
                console.debug('Ensuring ' + this.name);
            }
            bongo.getStoredSignature(this.name, function (signature) {
                if (bongo.equals(signature, _this.signature())) {
                    bongo.getStoredVersion(_this.name, function (version) {
                        _this.version = version;
                        callback();
                    });
                    _this.ensured = true;
                    return;
                }
                bongo.getStoredVersion(_this.name, function (version) {
                    _this.version = version + 1;
                    var request = bongo.indexedDB.open(_this.name, _this.version);
                    request.onblocked = function (event) {
                        console.log('blocked', request.error.name);
                    };
                    request.onupgradeneeded = function (event) {
                        var db = request.result;
                        for(var x = 0; x < _this.objectStores.length; x++) {
                            _this.objectStores[x].ensureObjectStore(db);
                        }
                        for(var name in signature.objectStores) {
                            if (typeof _this[name] === 'undefined' && db.objectStoreNames.contains(name)) {
                                db.deleteObjectStore(name);
                            }
                        }
                        db.close();
                        setTimeout(function () {
                            callback();
                        }, 1);
                        _this.ensured = true;
                    };
                });
            });
        };
        return Database;
    })();
    bongo.Database = Database;    
})(bongo || (bongo = {}));
var bongo;
(function (bongo) {
    var ObjectStore = (function () {
        function ObjectStore(database, definition) {
            this.database = database;
            this.name = definition.name;
            this.keyPath = definition.keyPath || '_id';
            this.autoIncrement = !!definition.autoIncrement;
            this.indexes = definition.indexes || [];
        }
        ObjectStore.prototype.filter = function (fn) {
            var query = new bongo.Query(this.database, [
                this.name
            ]);
            return query.filter(fn);
        };
        ObjectStore.prototype.find = function (criteria, fields) {
            if (typeof fields === "undefined") { fields = null; }
            var query = new bongo.Query(this.database, [
                this.name
            ]);
            return query.find(criteria, fields);
        };
        ObjectStore.prototype.findOne = function (criteria, callback) {
            var query = new bongo.Query(this.database, [
                this.name
            ]);
            return query.findOne(criteria, callback);
        };
        ObjectStore.prototype.count = function (criteria, callback) {
            var _this = this;
            if (typeof callback === 'undefined' && typeof criteria === 'function') {
                callback = [
                    criteria, 
                    criteria = null
                ][0];
            }
            var request;
            var success = function (event) {
                callback(event.target.result);
            };
            this.database.get(function (database) {
                var transaction = database.transaction([
                    _this.name
                ], "readonly");
                var objectStore = transaction.objectStore(_this.name);
                request = objectStore.count();
                request.onsuccess = success;
            }.bind(this));
        };
        ObjectStore.prototype.ensureObjectStore = function (database) {
            if (bongo.debug) {
                console.debug('ensureObjectStore');
            }
            if (!database.objectStoreNames || !database.objectStoreNames.contains(this.name)) {
                if (bongo.debug) {
                    console.debug('Creating ' + this.name);
                }
                var objectStore = database.createObjectStore(this.name, {
                    keyPath: "_id",
                    autoIncrement: false
                });
            } else {
            }
            return objectStore;
        };
        ObjectStore.prototype.get = function (id, callback) {
            if (typeof id === "undefined") { id = ''; }
            if (typeof callback === "undefined") { callback = function (error, result) {
            }; }
            var _this = this;
            this.database.get(function (database) {
                var transaction = database.transaction([
                    _this.name
                ], "readonly");
                var objectStore = transaction.objectStore(_this.name);
                var request = objectStore.get(id);
                request.onsuccess = function (event) {
                    callback(event.target.error, event.target.result);
                };
            }.bind(this));
        };
        ObjectStore.prototype.remove = function (criteria, callback) {
            if (typeof callback === "undefined") { callback = function (error, result) {
            }; }
            var _this = this;
            this.database.get(function (database) {
                var transaction = database.transaction([
                    _this.name
                ], "readwrite");
                var objectStore = transaction.objectStore(_this.name);
                var request;
                if (typeof criteria === "string") {
                    request = objectStore.delete(criteria);
                } else if (JSON.stringify(criteria) === "{}") {
                    request = objectStore.clear();
                }
                request.onsuccess = function (event) {
                    callback(event.target.error, event.target.result);
                };
            }, true);
        };
        ObjectStore.prototype.save = function (data, callback) {
            if (typeof callback === "undefined") { callback = function () {
            }; }
            var _this = this;
            if (!data._id) {
                data._id = bongo.key();
            }
            this.database.get(function (database) {
                var transaction = database.transaction(_this.name, "readwrite");
                var objectStore = transaction.objectStore(_this.name);
                var request = objectStore.put(data);
                request.onsuccess = function (event) {
                    callback(event.target.error, event.target.result);
                };
            }, true);
        };
        ObjectStore.prototype.insert = function (data, callback) {
            if (typeof callback === "undefined") { callback = function () {
            }; }
            var _this = this;
            if (!data._id) {
                data._id = bongo.key();
            }
            this.database.get(function (database) {
                var transaction = database.transaction([
                    _this.name
                ], "readwrite");
                var objectStore = transaction.objectStore(_this.name);
                var request = objectStore.add(data);
                request.onerror = function (event) {
                    console.log(event.target.error);
                };
                request.onsuccess = function (event) {
                    callback(event.target.error, event.target.result);
                };
            }, true);
        };
        ObjectStore.prototype.oldFind = function (options, callback) {
            var _this = this;
            var criteria = options.criteria || {};
            var skip = options.skip || 0;
            this.database.get(function (database) {
                var transaction = database.transaction([
                    _this.name
                ], "readonly");
                var objectStore = transaction.objectStore(_this.name);
                var sortKeys = [];
                if (options.sort) {
                    sortKeys = Object.keys(options.sort);
                }
                var criteriaKeys = Object.keys(criteria);
                if (typeof criteria[criteriaKeys[0]] === "boolean") {
                    criteria[criteriaKeys[0]] = criteria[criteriaKeys[0]] ? 1 : 0;
                }
                var data = [];
                var range, index, cursorSuccess;
                if (criteriaKeys.length === 1 && objectStore.indexNames && objectStore.indexNames.contains(criteriaKeys[0])) {
                    cursorSuccess = function (event) {
                        if (event.target.error) {
                            return callback(event.target.error);
                        }
                        var cursor = event.target.result;
                        if (skip > 0) {
                            skip--;
                        } else if (cursor) {
                            data.push(cursor.value);
                        }
                        if (cursor && (!options.limit || data.length < options.limit)) {
                            cursor['continue']();
                        } else {
                            callback(null, data);
                            return;
                        }
                    };
                    index = objectStore.index(criteriaKeys[0]);
                    range = bongo.IDBKeyRange.only(criteria[criteriaKeys[0]]);
                    index.openCursor(range).onsuccess = cursorSuccess;
                    return;
                }
                cursorSuccess = function (event) {
                    if (event.target.error) {
                        return callback(event.target.error);
                    }
                    var cursor = event.target.result;
                    if (cursor) {
                        if (!criteriaKeys.length) {
                            if (skip > 0) {
                                skip--;
                            } else if (cursor) {
                                data.push(cursor.value);
                            }
                        } else {
                            var match = true;
                            var key;
                            for(key in criteriaKeys) {
                                if (typeof cursor.value[criteriaKeys[key]] === "undefined" || cursor.value[criteriaKeys[key]] !== criteria[criteriaKeys[key]]) {
                                    match = false;
                                }
                            }
                            if (match) {
                                data.push(cursor.value);
                            }
                        }
                        if (!options.limit || data.length < options.limit) {
                            cursor['continue']();
                        } else {
                            callback(null, data);
                            return;
                        }
                    } else {
                        callback(null, data);
                        return;
                    }
                };
                if (options.sort && objectStore.indexNames.contains(sortKeys[0])) {
                    index = objectStore.index(sortKeys[0]);
                    if (options.sort[sortKeys[0]] === 1) {
                        index.openCursor().onsuccess = cursorSuccess;
                    } else {
                        index.openCursor(null, 'prev').onsuccess = cursorSuccess;
                    }
                    return;
                }
                objectStore.openCursor().onsuccess = cursorSuccess;
            });
        };
        return ObjectStore;
    })();
    bongo.ObjectStore = ObjectStore;    
    function key() {
        var key_t = Math.floor(new Date().valueOf() / 1000).toString(16);
        if (!this.key_m) {
            this.key_m = Math.floor(Math.random() * (16777216)).toString(16);
        }
        if (!this.key_p) {
            this.key_p = Math.floor(Math.random() * (32767)).toString(16);
        }
        if (typeof this.key_i === "undefined") {
            this.key_i = 0;
        } else if (this.key_i > 0xffffff) {
            this.key_i = 0;
        }
        this.key_i = Number(this.key_i);
        this.key_i++;
        var i = this.key_i.toString(16);
        var r = '00000000'.substr(0, 6 - key_t.length) + key_t + '000000'.substr(0, 6 - this.key_m.length) + this.key_m + '0000'.substr(0, 4 - this.key_p.length) + this.key_p + '000000'.substr(0, 6 - i.length) + i;
        return r;
    }
    bongo.key = key;
})(bongo || (bongo = {}));
var bongo;
(function (bongo) {
    var Query = (function () {
        function Query(database, objectStores) {
            this.database = database;
            this.objectStores = objectStores;
            this._limit = 100;
            this._skip = 0;
            this.from = null;
            this.to = null;
            this.before = null;
            this.after = null;
            this.filters = [];
            this.keys = [];
        }
        Query.prototype.findOne = function (criteria, callback) {
            if (!bongo.supported) {
                return callback('IndexedDB not supported');
            }
            this.find(criteria).limit(1).toArray(function (error, results) {
                if (error) {
                    return callback(error);
                }
                if (!results.length) {
                    callback(error, null);
                } else {
                    callback(error, results[0]);
                }
            });
        };
        Query.prototype.find = function (criteria, fields) {
            if (typeof criteria === "undefined") { criteria = {}; }
            if (typeof fields === "undefined") { fields = null; }
            var key;
            if (fields && typeof fields === 'object') {
                var _fields = [];
                for(key in fields) {
                    if (fields[key]) {
                        _fields.push(key);
                    }
                }
                this.pick(_fields);
            }
            this.filters.push(function (doc) {
                var match = true, x, y;
                for(var key in criteria) {
                    if (criteria[key].constructor === Object) {
                        for(x in criteria[key]) {
                            if (x !== '$nin' && typeof doc[key] === 'undefined') {
                                return false;
                            }
                            if (x === '$gt') {
                                if (doc[key] <= criteria[key][x]) {
                                    return false;
                                }
                            } else if (x === '$gte') {
                                if (doc[key] < criteria[key][x]) {
                                    return false;
                                }
                            } else if (x === '$lt') {
                                if (doc[key] >= criteria[key][x]) {
                                    return false;
                                }
                            } else if (x === '$lte') {
                                if (doc[key] > criteria[key][x]) {
                                    return false;
                                }
                            } else if (x === '$ne') {
                                if (doc[key] == criteria[key][x]) {
                                    return false;
                                }
                            } else if (x === '$in' && criteria[key][x] instanceof Array) {
                                if (criteria[key][x].indexOf(doc[key]) === -1) {
                                    return false;
                                }
                            } else if (x === '$nin' && criteria[key][x] instanceof Array) {
                                if (criteria[key][x].indexOf(doc[key]) !== -1) {
                                    return false;
                                }
                            } else if (x === '$all' && doc[key] instanceof Array && criteria[key][x] instanceof Array) {
                                for(y = 0; y < criteria[key][x].length; y++) {
                                    if (doc[key].indexOf(criteria[key][x][y]) === -1) {
                                        return false;
                                    }
                                }
                            } else {
                                return false;
                            }
                        }
                    } else if (typeof doc[key] === 'undefined') {
                        return false;
                    } else if (typeof criteria[key] === 'string') {
                        if (doc[key] != criteria[key]) {
                            return false;
                        }
                    } else if (typeof criteria[key] === 'object' && criteria[key] instanceof RegExp) {
                        if (!criteria[key].test(doc[key])) {
                            return false;
                        }
                    }
                }
                return true;
            });
            return this;
        };
        Query.prototype.filter = function (fn) {
            this.filters.push(fn);
            return this;
        };
        Query.prototype.skip = function (skip) {
            this._skip = skip;
            return this;
        };
        Query.prototype.limit = function (limit) {
            this._limit = limit;
            return this;
        };
        Query.prototype.pick = function (keys) {
            this.keys = keys;
            return this;
        };
        Query.prototype.toArray = function (callback) {
            var _this = this;
            if (!bongo.supported) {
                return callback('IndexedDB not supported');
            }
            this.database.get(function (database) {
                var transaction = database.transaction(_this.objectStores, "readonly");
                var objectStore = transaction.objectStore(_this.objectStores[0]);
                var results = [];
                var cursorSuccess = function (event) {
                    if (event.target.error) {
                        database.close();
                        return callback(event.target.error);
                    }
                    var value, match, cursor = event.target.result;
                    if (cursor) {
                        value = cursor.value;
                        if (!_this.filters.length) {
                            if (_this._skip > 0) {
                                _this._skip--;
                            } else {
                                if (_this.keys.length) {
                                    value = pick(value, _this.keys);
                                }
                                results.push(value);
                            }
                        } else {
                            match = true;
                            for(var x = 0; x < _this.filters.length; x++) {
                                if (!_this.filters[x](cursor.value)) {
                                    match = false;
                                }
                            }
                            if (match) {
                                if (_this.keys.length) {
                                    value = pick(value, _this.keys);
                                }
                                results.push(value);
                            }
                        }
                        if (results.length < _this._limit) {
                            cursor.continue();
                        } else {
                            database.close();
                            callback(null, results);
                            return;
                        }
                    } else {
                        database.close();
                        callback(null, results);
                        return;
                    }
                };
                objectStore.openCursor().onsuccess = cursorSuccess;
            });
        };
        return Query;
    })();
    bongo.Query = Query;    
    function pick(obj, keys) {
        var copy = {};
        for(var x = 0; x < keys.length; x++) {
            if (keys[x] in obj) {
                copy[keys[x]] = obj[keys[x]];
            }
            ;
        }
        return copy;
    }
})(bongo || (bongo = {}));


var bongo;
(function (bongo) {
    bongo.debug = false;
    bongo.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    bongo.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    bongo.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    bongo.supported = !!bongo.indexedDB && !!bongo.IDBTransaction && !!bongo.IDBKeyRange;
    function db(definition, callback) {
        if (typeof callback === "undefined") { callback = function () {
        }; }
        if (typeof definition === "string") {
            if (typeof bongo[definition] !== 'undefined') {
                return bongo[definition];
            } else {
                definition = {
                    name: definition
                };
            }
        }
        if (typeof bongo[definition.name] === 'undefined') {
            Object.defineProperty(bongo, definition.name, {
                value: new bongo.Database(definition, callback)
            });
        }
        return bongo[definition.name];
    }
    bongo.db = db;
    function getStoredVersion(name, callback) {
        if (typeof callback === "undefined") { callback = function (version) {
            console.log(version);
        }; }
        var request = bongo.indexedDB.open(name);
        request.onsuccess = function (event) {
            var db = event.target.result;
            db.close();
            callback(db.version);
        };
    }
    bongo.getStoredVersion = getStoredVersion;
    function getStoredSignature(name, callback) {
        if (typeof callback === "undefined") { callback = function (signature) {
            console.log(signature);
        }; }
        var request = bongo.indexedDB.open(name);
        request.onblocked = function (event) {
            console.log('blocked', event);
        };
        request.onsuccess = function (event) {
            var x, indexes, db = event.target.result;
            var name, objectStore, objectStoreNames = [], objectStores = {};
            for(x = 0; x < db.objectStoreNames.length; x++) {
                objectStoreNames.push(db.objectStoreNames.item(x));
            }
            if (objectStoreNames.length) {
                var transaction = db.transaction(objectStoreNames, "readonly");
                objectStoreNames.forEach(function (objectStoreName) {
                    var objectStore = transaction.objectStore(objectStoreName);
                    indexes = [];
                    for(var x = 0; x < objectStore.indexNames.length; x++) {
                        indexes.push(objectStore.indexNames.item(x));
                    }
                    objectStores[objectStoreName] = {
                        autoIncrement: objectStore.autoIncrement,
                        indexes: indexes,
                        keyPath: objectStore.keyPath,
                        name: objectStore.name
                    };
                });
                transaction.oncomplete = function () {
                    db.close(name);
                    return callback({
                        name: db.name,
                        objectStores: objectStores
                    });
                };
            } else {
                db.close(name);
                return callback({
                    name: db.name,
                    objectStores: objectStores
                });
            }
        };
    }
    bongo.getStoredSignature = getStoredSignature;
    function equals(x, y) {
        var p;
        if (x === y) {
            return true;
        }
        for(p in x) {
            if (typeof (y[p]) == 'undefined') {
                return false;
            }
        }
        for(p in y) {
            if (typeof (x[p]) == 'undefined') {
                return false;
            }
        }
        if (typeof x !== typeof y) {
            return false;
        }
        if (typeof x === 'object') {
            for(p in x) {
                if (x[p]) {
                    if (typeof (x[p]) === 'object') {
                        if (!equals(x[p], y[p])) {
                            return false;
                        }
                    } else {
                        if (x[p] !== y[p]) {
                            return false;
                        }
                    }
                } else {
                    if (y[p]) {
                        return false;
                    }
                }
            }
        } else {
            return x === y;
        }
        return true;
    }
    bongo.equals = equals;
    function info(name) {
        if (typeof name === "undefined") { name = null; }
        console.group('Bongo');
        var request;
        var debugDb = function (name) {
            var request = bongo.indexedDB.open(name);
            request.onsuccess = function (event) {
                var db = event.target.result;
                var objectStoreNames = [];
                for(var x = 0; x < db.objectStoreNames.length; x++) {
                    objectStoreNames.push(db.objectStoreNames.item(x));
                }
                console.log({
                    name: db.name,
                    objectStores: objectStoreNames,
                    version: db.version
                });
            };
        };
        if (name) {
            debugDb(name);
        } else {
            if (bongo.indexedDB.webkitGetDatabaseNames) {
                request = bongo.indexedDB.webkitGetDatabaseNames();
                request.onsuccess = function (event) {
                    var dbNameList = event.target.result;
                    for(var x = 0; x < dbNameList.length; x++) {
                        debugDb(dbNameList.item(x));
                    }
                };
            }
        }
        console.groupEnd();
    }
    bongo.info = info;
})(bongo || (bongo = {}));
if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = bongo;
} else if (typeof define === "function" && define.amd) {
    define("bongo", [], function () {
        return bongo;
    });
}
//@ sourceMappingURL=bongo.es5.js.map
