var BaseDoc, DBStore, _, _stores, config, fs, path, q, wrapMethods,
  slice = [].slice;

_ = require("underscore");

fs = require("fs");

path = require("path");

DBStore = require("nedb");

path = require("path");

config = {
  appPath: function(_path) {
    if (_path == null) {
      _path = "";
    }
    return path.join(__dirname, "../", _path);
  }
};

q = require("q");

wrapMethods = function(obj, methods) {
  var fn, generateNewMethod, i, len, m;
  generateNewMethod = function(oldMethod) {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return new Promise(function(res, rej) {
        var callback;
        callback = function() {
          var err, ret;
          err = arguments[0], ret = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          if (err) {
            return rej.apply(null, [err].concat(slice.call(ret)));
          } else {
            return res.apply(null, ret);
          }
        };
        if (args.length) {
          return oldMethod.apply(null, slice.call(args).concat([callback]));
        } else {
          return oldMethod(callback);
        }
      });
    };
  };
  fn = function(oldMethod) {
    return obj[m] = generateNewMethod(oldMethod);
  };
  for (i = 0, len = methods.length; i < len; i++) {
    m = methods[i];
    fn(obj[m].bind(obj));
  }
  return obj;
};

DBStore.dbStatus = function() {
  var dbPath;
  dbPath = config.appPath("db/");
  return q.nfcall(fs.readdir, dbPath).then(function(data) {
    var dbs, dfds;
    dbs = _.filter(data, function(path) {
      return (path != null ? path.indexOf(".db") : void 0) !== -1;
    });
    dfds = _.map(dbs, function(fname) {
      var fpath;
      fpath = path.join(dbPath, fname);
      return q.nfcall(fs.stat, fpath).then(function(ret) {
        data = _.pick(ret, "mtime,ctime,size".split(","));
        data.path = fpath;
        data._id = data.name = path.parse(fname).name;
        return data;
      });
    });
    return q.all(dfds);
  });
};

DBStore.storePath = function(name) {
  return config.appPath("db/" + name + ".db");
};

DBStore.storeConfig = function(name) {
  var conf;
  conf = {
    filename: DBStore.storePath(name)
  };
  return conf;
};

_stores = {};

DBStore.getStore = function(name) {
  var cache, dbconfig, store;
  if (cache = _stores[name]) {
    return q.when(cache);
  }
  dbconfig = DBStore.storeConfig(name);
  store = new DBStore(dbconfig);
  return new Promise(function(res, rej) {
    store.loadDatabase(function(err) {
      wrapMethods(store, ["findOne", "insert", "update", "remove", "count"]);
      if (!err) {
        return res(store);
      } else {
        return rej(err);
      }
    });
    return _stores[name] = store;
  });
};

BaseDoc = (function() {
  BaseDoc.store = "test";

  function BaseDoc(data, val) {
    if (val) {
      data = {
        data: val
      };
    }
    this._data = _.extend({}, data);
    this.changed = true;
    this.id = data._id;
    _.extend(this, _.pick(this.constructor, ["store", "getStore"]));
  }

  BaseDoc.prototype.set = function(object) {
    _.extend(this._data, object);
    this.changed = true;
    return this;
  };

  BaseDoc.prototype.get = function(key) {
    if (key == null) {
      key = null;
    }
    if (!key) {
      return this._data;
    } else {
      return this._data[key];
    }
  };

  BaseDoc.prototype.omit = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._data = _.omit.apply(_, [this._data].concat(slice.call(args)));
  };

  BaseDoc.prototype.save = function(object) {
    var data, where;
    if (object) {
      this.set(object);
    }
    data = this._data;
    where = _.pick(data, "_id");
    return this.getStore().then((function(_this) {
      return function(store) {
        if (data._id) {
          return store.update(where, data, {}).then(function() {
            return _this.constructor.findOne({
              _id: data._id
            });
          });
        } else {
          return store.insert(data).then(function(data) {
            _this._data = data;
            _this.id = data._id;
            return new _this.constructor(data);
          });
        }
      };
    })(this)).then((function(_this) {
      return function(data) {
        _this.changed = false;
        return data;
      };
    })(this));
  };

  BaseDoc.prototype.remove = function() {
    return this.getStore().then((function(_this) {
      return function(store) {
        var where;
        where = _.pick(_this._data, "_id");
        return store.remove(where, {});
      };
    })(this)).then((function(_this) {
      return function(num) {
        var id;
        id = _this._data._id;
        delete _this._data._id;
        _this.isDeleted = true;
        return num;
      };
    })(this));
  };

  BaseDoc.count = function(data) {
    return this.getStore().then(function(store) {
      return store.count(data).then(function(num) {
        return {
          count: num,
          id: -1
        };
      });
    });
  };

  BaseDoc.findByID = function(id) {
    var DocClass;
    DocClass = this;
    return this.find({
      _id: id
    }).then(function(data) {
      if (!data.length) {
        return q.reject({
          message: "not found by id " + id
        });
      }
      return new DocClass(data[0]);
    });
  };

  BaseDoc.remove = function(where) {
    return this.getStore().then(function(store) {
      return store.remove(where, {
        multi: true
      });
    });
  };

  BaseDoc.removeByID = function(id) {
    return this.getStore().then(function(store) {
      return store.remove({
        _id: id
      }, {});
    });
  };

  BaseDoc.getStore = function() {
    return q.when(DBStore.getStore(this.store));
  };

  BaseDoc.findOne = function() {
    var DocClass, args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    DocClass = this;
    return this.getStore().then(function(store) {
      return store.findOne.apply(store, args).then(function(data) {
        return new DocClass(data);
      });
    });
  };

  BaseDoc.find = function() {
    var args, where;
    where = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (where == null) {
      where = {};
    }
    return this.getStore().then(function(store) {
      var act;
      act = store.find.apply(store, [where].concat(slice.call(args)));
      return q.ninvoke(act, "exec");
    });
  };

  return BaseDoc;

})();

module.exports = {
  BaseDoc: BaseDoc,
  DBStore: DBStore
};
