var BaseDoc, DBStore, User, UserDoc, UserFile, _, _hasKeys, crypto, fs, path, q, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

require('coffee-script/register');

ref = require("./db.coffee"), BaseDoc = ref.BaseDoc, DBStore = ref.DBStore;

crypto = require('crypto');

_ = require('underscore');

q = require("q");

q.longStackSupport = true;

fs = require("fs");

path = require("path");

_hasKeys = function(obj, keys) {
  var i, k, len;
  for (i = 0, len = keys.length; i < len; i++) {
    k = keys[i];
    if (!obj[k]) {
      return false;
    }
  }
  return true;
};

UserDoc = (function(superClass) {
  extend(UserDoc, superClass);

  UserDoc.store = "userdocs";

  function UserDoc(data) {
    UserDoc.__super__.constructor.call(this, data);
  }

  UserDoc.prototype.checkData = function(data) {
    var user;
    if (data == null) {
      data = this._data;
    }
    if (user = data.user) {
      data.user_id = user.id || user._id;
      return _.omit(data, "user");
    }
    if (!data.user_id) {
      return {
        error: {
          code: 400,
          message: "UserDoc " + this.store + " must have user data or user_id"
        }
      };
    }
    return data;
  };

  UserDoc.prototype.save = function(_data) {
    var data, err;
    if (_data == null) {
      _data = null;
    }
    data = this.checkData(_data);
    this.set(data);
    this.omit("user");
    if (err = data != null ? data.error : void 0) {
      return q.reject({
        error: err
      });
    }
    return UserDoc.__super__.save.call(this, data);
  };

  return UserDoc;

})(BaseDoc);

UserFile = (function(superClass) {
  extend(UserFile, superClass);

  function UserFile() {
    return UserFile.__super__.constructor.apply(this, arguments);
  }

  UserFile.store = "userfiles";

  UserFile.prototype.remove = function() {
    return q.nfcall(fs.unlink, this.get("path")).then((function(_this) {
      return function() {
        return UserFile.__super__.remove.call(_this);
      };
    })(this));
  };

  UserFile.prototype.save = function(data) {
    var extname, fname, getTarget, getUrl, source;
    if (data == null) {
      data = null;
    }
    if (data == null) {
      data = this._data;
    }
    source = data.file;
    source = (source != null ? source.path : void 0) || source;
    if ((data != null ? data.path : void 0) && !source) {
      this.set(data);
      return UserFile.__super__.save.call(this);
    }
    fname = path.basename(source);
    extname = path.extname(fname).slice(1);
    getUrl = function(id) {
      return "uploads/" + id + "." + extname;
    };
    getTarget = function(id) {
      return __dirname + "/../../public/" + (getUrl(id));
    };
    return q.nfcall(fs.stat, source).then((function(_this) {
      return function(info) {
        var fdoc, stat;
        fdoc = {
          fname: fname,
          extname: extname
        };
        stat = _.pick(info, "mtime", "size", "ctime");
        fdoc = _.extend(fdoc, data, stat);
        _this.set(fdoc);
        _this.omit("file");
        return UserFile.__super__.save.call(_this);
      };
    })(this)).then((function(_this) {
      return function(doc) {
        var id, target, url;
        id = doc.id;
        target = getTarget(id);
        url = getUrl(id);
        _this.set({
          path: target,
          url: url
        });
        return UserFile.__super__.save.call(_this);
      };
    })(this)).then(function(doc) {
      return q.nfcall(fs.rename, source, getTarget(doc.id)).then(function() {
        return doc;
      });
    });
  };

  return UserFile;

})(UserDoc);

User = (function(superClass) {
  var md5;

  extend(User, superClass);

  function User() {
    return User.__super__.constructor.apply(this, arguments);
  }

  User.UserDoc = UserDoc;

  User.UserFile = UserFile;

  md5 = function(_str) {
    return crypto.createHash('md5').update(_str).digest('hex');
  };

  User.hash = function(str) {
    return md5(md5(str));
  };

  User.store = "user";

  User.register = function(data) {
    if (!_hasKeys(data, ["email", "name", "password"])) {
      return Promise.reject({
        error: {
          code: 406,
          message: "needed more info to register"
        },
        data: data
      });
    }
    return this.find({
      $or: [
        {
          email: data.email
        }, {
          name: data.name
        }
      ]
    }).then((function(_this) {
      return function(ret) {
        var user;
        if (ret.length) {
          return q.reject({
            error: {
              code: 409,
              message: "name or email already exists"
            }
          });
        } else {
          data = _.extend({}, data, {
            password: _this.hash(data.password)
          });
          user = new _this(data);
          return user.save().then(function() {
            return user;
          });
        }
      };
    })(this));
  };

  User.login = function(data) {
    if (!data.password) {
      Promise.reject({
        error: {
          code: 406,
          message: "no password"
        },
        data: data
      });
    }
    data.password = this.hash(data.password);
    return this.findOne(data).then(function(user) {
      return user;
    });
  };

  return User;

})(BaseDoc);

module.exports = User;
