(function() {
  var User, crypto, mongoose;

  mongoose = require("mongoose");

  crypto = require("crypto");

  User = mongoose.model('User', {
    name: {
      type: "String",
      lowercase: true
    },
    email: {
      type: "String",
      index: {
        unique: true,
        dropDups: true
      }
    },
    password: {
      type: "String",
      unique: false
    },
    role: "String"
  });

  User.parsePassword = function(password) {
    return crypto.createHash('sha512').update(password).digest('base64');
  };

  User.login = function(data, callback) {
    data.password = User.parsePassword(data.password);
    return User.findOne(data).select("-password").exec(function(err, ret) {
      return callback(err, ret);
    });
  };

  exports.model = User;

}).call(this);
