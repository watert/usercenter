var Model, User,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Model = require("./base.js");

User = (function(superClass) {
  extend(User, superClass);

  function User() {
    return User.__super__.constructor.apply(this, arguments);
  }

  User.prototype.idAttribute = "_id";

  User.prototype.url = "api/";

  User.prototype.rootUrl = "api/";

  User.profile = function(data) {
    var user;
    return (user = new this(data)).fetch().then(function() {
      return user;
    });
  };

  User.register = function(data) {
    return this.post("register", data).then(function(res) {
      return new User(res.data);
    });
  };

  User.login = function(data) {
    return this.post("login", data).then(function(res) {
      return new User(res.data);
    });
  };

  return User;

})(Model);

module.exports = User;
