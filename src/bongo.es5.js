var bongo;
(function (bongo) {
    var Database = (function () {
        function Database(definition) {
            this.collections = [];
            definition.collections = definition.collections || [];
            this.name = definition.name;
            this.setVersion(definition.version);
            for(var x = 0; x < definition.collections.length; x++) {
                var collection = new bongo.Collection(this, definition.collections[x]);
                this[collection.name] = collection;
                this.collections.push(collection);
            }
        }
        Database.prototype.delete = function (callback) {
            if (typeof callback === "undefined") { callback = function () {
            }; }
            var _this = this;
            var tries = 0;
            for(var x = 0; x < this.collections.length; x++) {
                delete this[this.collections[x].name];
            }
            delete this.collections;
            var tryToDelete = function () {
                var request = window.indexedDB.deleteDatabase(_this.name);
                request.onsuccess = function (event) {
                    callback();
                }.bind(_this);
                request.onblocked = function (event) {
                    if(tries < 40) {
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
        Database.prototype.get = function (callback, readwrite) {
            if (typeof readwrite === "undefined") { readwrite = false; }
            var _this = this;
            if(readwrite) {
                var request = window.indexedDB.open(this.name, this.version);
            } else {
                var request = window.indexedDB.open(this.name);
            }
            request.onsuccess = function (event) {
                if(bongo.debug) {
                    console.debug('onsuccess');
                }
                callback(request.result);
            };
            request.onupgradeneeded = function (event) {
                if(bongo.debug) {
                    console.debug('onupgradeneeded');
                }
                for(var x = 0; x < _this.collections.length; x++) {
                    _this.collections[x].ensureObjectStore(request.result);
                }
            }.bind(this);
            request.onblocked = function (event) {
                throw request.webkitErrorMessage || request.error.name;
            };
            request.onerror = function (event) {
                throw request.webkitErrorMessage || request.error.name;
            };
            request.onfailure = request.onerror;
        };
        Database.prototype.setVersion = function (version) {
            if(typeof version === 'number') {
                this.version = version;
                return;
            }
            if(typeof version === 'string') {
                this.version = parseInt(version, 10);
                return;
            }
            if(version instanceof Date) {
                this.version = Math.round(version.getTime());
                return;
            }
            if(typeof version === "undefined") {
                var version = 1;
                this.version = version;
            }
        };
        return Database;
    })();
    bongo.Database = Database;    
})(bongo || (bongo = {}));
var bongo;
(function (bongo) {
    var Collection = (function () {
        function Collection(database, name, indexes) {
            if (typeof indexes === "undefined") { indexes = []; }
            this.database = database;
            this.name = name;
            this.indexes = indexes;
        }
        Collection.prototype.filter = function (fn) {
            var query = new bongo.Query(this.database, [
                this.name
            ]);
            return query.filter(fn);
        };
        Collection.prototype.find = function (criteria) {
            var query = new bongo.Query(this.database, [
                this.name
            ]);
            return query.find(criteria);
        };
        Collection.prototype.findOne = function (criteria) {
            var query = new bongo.Query(this.database, [
                this.name
            ]);
            return query.findOne(criteria);
        };
        Collection.prototype.count = function (criteria, callback) {
            var _this = this;
            if(typeof callback === 'undefined' && typeof criteria === 'function') {
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
        Collection.prototype.ensureObjectStore = function (database) {
            if(bongo.debug) {
                console.debug('ensureObjectStore');
            }
            if(!database.objectStoreNames || !database.objectStoreNames.contains(this.name)) {
                if(bongo.debug) {
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
        Collection.prototype.get = function (id, callback) {
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
        Collection.prototype.remove = function (criteria, callback) {
            if (typeof callback === "undefined") { callback = function (error, result) {
            }; }
            var _this = this;
            this.database.get(function (database) {
                var transaction = database.transaction([
                    _this.name
                ], "readwrite");
                var objectStore = transaction.objectStore(_this.name);
                var request;
                if(typeof criteria === "string") {
                    request = objectStore.delete(criteria);
                } else if(JSON.stringify(criteria) === "{}") {
                    request = objectStore.clear();
                }
                request.onsuccess = function (event) {
                    callback(event.target.error, event.target.result);
                };
            }.bind(this));
        };
        Collection.prototype.save = function (data, callback) {
            if (typeof callback === "undefined") { callback = function () {
            }; }
            var _this = this;
            if(!data._id) {
                data._id = bongo.key();
            }
            this.database.get(function (database) {
                var transaction = database.transaction(_this.name, "readwrite");
                var objectStore = transaction.objectStore(_this.name);
                var request = objectStore.put(data);
                request.onsuccess = function (event) {
                    callback(event.target.error, event.target.result);
                };
            });
        };
        Collection.prototype.insert = function (data, callback) {
            if (typeof callback === "undefined") { callback = function () {
            }; }
            var _this = this;
            if(!data._id) {
                data._id = bongo.key();
            }
            this.database.get(function (database) {
                var transaction = database.transaction([
                    _this.name
                ], "readwrite");
                var objectStore = transaction.objectStore(_this.name);
                var request = objectStore.add(data);
                request.onsuccess = function (event) {
                    callback(event.target.error, event.target.result);
                };
            });
        };
        Collection.prototype.oldFind = function (options, callback) {
            var _this = this;
            var criteria = options.criteria || {
            };
            var skip = options.skip || 0;
            this.database.get(function (database) {
                var transaction = database.transaction([
                    _this.name
                ], "readonly");
                var objectStore = transaction.objectStore(_this.name);
                var sortKeys = [];
                if(options.sort) {
                    sortKeys = Object.keys(options.sort);
                }
                var criteriaKeys = Object.keys(criteria);
                if(typeof criteria[criteriaKeys[0]] === "boolean") {
                    criteria[criteriaKeys[0]] = criteria[criteriaKeys[0]] ? 1 : 0;
                }
                var data = [];
                var range, index, cursorSuccess;
                if(criteriaKeys.length === 1 && objectStore.indexNames && objectStore.indexNames.contains(criteriaKeys[0])) {
                    cursorSuccess = function (event) {
                        if(event.target.error) {
                            return callback(event.target.error);
                        }
                        var cursor = event.target.result;
                        if(skip > 0) {
                            skip--;
                        } else if(cursor) {
                            data.push(cursor.value);
                        }
                        if(cursor && (!options.limit || data.length < options.limit)) {
                            cursor['continue']();
                        } else {
                            callback(null, data);
                            return;
                        }
                    };
                    index = objectStore.index(criteriaKeys[0]);
                    range = window.IDBKeyRange.only(criteria[criteriaKeys[0]]);
                    index.openCursor(range).onsuccess = cursorSuccess;
                    return;
                }
                cursorSuccess = function (event) {
                    if(event.target.error) {
                        return callback(event.target.error);
                    }
                    var cursor = event.target.result;
                    if(cursor) {
                        if(!criteriaKeys.length) {
                            if(skip > 0) {
                                skip--;
                            } else if(cursor) {
                                data.push(cursor.value);
                            }
                        } else {
                            var match = true;
                            var key;
                            for(key in criteriaKeys) {
                                if(typeof cursor.value[criteriaKeys[key]] === "undefined" || cursor.value[criteriaKeys[key]] !== criteria[criteriaKeys[key]]) {
                                    match = false;
                                }
                            }
                            if(match) {
                                data.push(cursor.value);
                            }
                        }
                        if(!options.limit || data.length < options.limit) {
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
                if(options.sort && objectStore.indexNames.contains(sortKeys[0])) {
                    index = objectStore.index(sortKeys[0]);
                    if(options.sort[sortKeys[0]] === 1) {
                        index.openCursor().onsuccess = cursorSuccess;
                    } else {
                        index.openCursor(null, 'prev').onsuccess = cursorSuccess;
                    }
                    return;
                }
                objectStore.openCursor().onsuccess = cursorSuccess;
            });
        };
        return Collection;
    })();
    bongo.Collection = Collection;    
    function key() {
        var key_t = Math.floor(new Date().valueOf() / 1000).toString(16);
        if(!this.key_m) {
            this.key_m = Math.floor(Math.random() * (16777216)).toString(16);
        }
        if(!this.key_p) {
            this.key_p = Math.floor(Math.random() * (32767)).toString(16);
        }
        if(typeof this.key_i === "undefined") {
            this.key_i = 0;
        } else if(this.key_i > 0xffffff) {
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
        Query.prototype.findOne = function (criteria) {
            this.limit = 1;
            this.find(criteria);
            return this;
        };
        Query.prototype.find = function (criteria) {
            if (typeof criteria === "undefined") { criteria = {
            }; }
            this.filters.push(function (doc) {
                var match = true;
                for(var key in criteria) {
                    if(typeof criteria[key] === 'string') {
                        if(typeof doc[key] === 'undefined' || doc[key] != criteria[key]) {
                            return false;
                        }
                    }
                }
                return match;
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
            this.database.get(function (database) {
                var transaction = database.transaction(_this.objectStores, "readonly");
                var objectStore = transaction.objectStore(_this.objectStores[0]);
                var results = [];
                var cursorSuccess = function (event) {
                    if(event.target.error) {
                        return callback(event.target.error);
                    }
                    var value, match, cursor = event.target.result;
                    if(cursor) {
                        value = cursor.value;
                        if(!_this.filters.length) {
                            if(_this._skip > 0) {
                                _this._skip--;
                            } else {
                                if(_this.keys.length) {
                                    value = pick(value, _this.keys);
                                }
                                results.push(value);
                            }
                        } else {
                            match = true;
                            for(var x = 0; x < _this.filters.length; x++) {
                                if(!_this.filters[x](cursor.value)) {
                                    match = false;
                                }
                            }
                            if(match) {
                                if(_this.keys.length) {
                                    value = pick(value, _this.keys);
                                }
                                results.push(value);
                            }
                        }
                        if(results.length < _this._limit) {
                            cursor.continue();
                        } else {
                            callback(null, results);
                            return;
                        }
                    } else {
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
        var copy = {
        };
        for(var x = 0; x < keys.length; x++) {
            if(keys[x] in obj) {
                copy[keys[x]] = obj[keys[x]];
            }
            ;
        }
        return copy;
    }
})(bongo || (bongo = {}));
var bongo;
(function (bongo) {
    function supported() {
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        return !!window.indexedDB && !!window.IDBTransaction && !!window.IDBKeyRange;
    }
    bongo.supported = supported;
    function db(definition) {
        if(typeof bongo[definition.name] === 'undefined') {
            Object.defineProperty(bongo, definition.name, {
                value: new bongo.Database(definition)
            });
        }
        return bongo[definition.name];
    }
    bongo.db = db;
    bongo.debug = false;
    function info(name) {
        if (typeof name === "undefined") { name = null; }
        console.group('Bongo');
        var request;
        var debugDb = function (name) {
            var request = window.indexedDB.open(name);
            request.onsuccess = function () {
                var db = event.target.result;
                console.log(db);
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
        if(name) {
            debugDb(name);
        } else {
            if(window.indexedDB.webkitGetDatabaseNames) {
                request = window.indexedDB.webkitGetDatabaseNames();
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
//@ sourceMappingURL=bongo.es5.js.map
