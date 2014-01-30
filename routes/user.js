/* 
	# Init with app
	userRoute = require("./routes/user.coffee") 
	userRoute.init(app,"/user/")
	app.get "/",(req,res)->
		user = userRoute.userByReq(req) #get user


	Getting User:
*/


(function() {
  var User, crypto, mongoose, query, userByReq, _;

  mongoose = require("mongoose");

  _ = require("underscore");

  crypto = require("crypto");

  User = require("../models/user").model;

  User.parse = function(user) {
    var hash;
    delete user.password;
    hash = crypto.createHash('md5').update(user.email.toLowerCase().trim()).digest('hex');
    if (user.toObject) {
      user = user.toObject();
    }
    user.gravatar = "http://www.gravatar.com/avatar/" + hash;
    return user;
  };

  exports.init;

  query = function(where, func) {
    return User.find().select("-password").exec(function(err, ret) {
      return res.jsonp(ret);
    });
  };

  userByReq = function(req, callback) {
    var user, _ref;
    if (callback == null) {
      callback = function() {
        return false;
      };
    }
    user = req != null ? (_ref = req.session) != null ? _ref.user : void 0 : void 0;
    User.findById(user != null ? user._id : void 0).exec(function(err, data) {
      return callback(err, data);
    });
    return user;
  };

  exports.userByReq = userByReq;

  exports.logout = function(req) {
    return req.session.user = false;
  };

  exports.init = function(app, base) {
    if (base == null) {
      base = "/user";
    }
    app.get("" + base + "/admin", function(req, res) {
      return userByReq(req, function(err, user) {
        if (!user) {
          return res.redirect("" + base + "/");
        } else {
          return res.render("page-admin");
        }
      });
    });
    app.get("" + base + "/profile", exports.profile);
    app.get("" + base + "/regist", exports.regist);
    app.post("" + base + "/regist", exports.registPost);
    app.get("" + base, exports.index);
    app.get("" + base + "/index", exports.index);
    app.post("" + base + "/login", exports.loginPost);
    app.post("" + base + "/login", function(req, res) {
      return res.redirect("" + base + "/profile");
    });
    app.get("" + base + "/logout", function(req, res) {
      exports.logout(req);
      return res.redirect("" + base + "/");
    });
    app.all("" + base + "/api/", exports.api);
    return app.all("" + base + "/api/:id", exports.api);
  };

  exports.index = function(req, res) {
    return res.render("index");
  };

  exports.api = function(req, res) {
    var data, id, method, _ref;
    method = req.route.method;
    data = req.data || req.body;
    id = (req != null ? (_ref = req.params) != null ? _ref.id : void 0 : void 0) || null;
    if (id === "my") {
      res.json(req.session.user);
      return;
    }
    if (data && data.password) {
      data.password = User.parsePassword(data.password);
    }
    switch (method) {
      case "get":
        return User.find().select("-password").sort({
          "_id": 1
        }).exec(function(err, ret) {
          var row;
          return res.jsonp((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = ret.length; _i < _len; _i++) {
              row = ret[_i];
              _results.push(User.parse(row));
            }
            return _results;
          })());
        });
      case "put":
        if (!id) {
          return res.json("No ID", 400);
        } else {
          return User.findById(id, function(err, model) {
            return model != null ? model.set(data).save(function(err) {
              if (!err) {
                return res.json(User.parse(model));
              }
            }) : void 0;
          });
        }
        break;
      case "delete":
        if (!id) {
          return res.json("No ID", 400);
        } else {
          return User.findByIdAndRemove(id, function(err, ret) {
            if (!err) {
              res.json("success");
              return exports.logout();
            } else {
              return res.json(err, 400);
            }
          });
        }
    }
  };

  exports.loginPost = function(req, res, next) {
    var data;
    data = req.body;
    data.password = User.parsePassword(data.password);
    return User.findOne(data).select("-password").exec(function(err, ret) {
      if (err) {
        return res.json("Login Error");
      } else if (ret) {
        req.session.user = ret;
        return next();
      } else {
        return res.json("Not Found");
      }
    });
  };

  exports.profile = function(req, res) {
    var user;
    user = req.session.user;
    console.log(user, "profile");
    user = User.parse(user);
    if (user) {
      return res.render("page-profiles", {
        user: user
      });
    } else {
      return res.redirect("" + base + "/");
    }
  };

  exports.index = function(req, res) {
    return res.render("index");
  };

  exports.registPost = function(req, res) {
    var data, u;
    data = req.body;
    data.password = User.parsePassword(data.password);
    u = new User(data);
    return u.save(function(err, ret) {
      if (!err) {
        return res.redirect("" + base + "/profile");
      } else {
        return res.jsonp(err);
      }
    });
  };

  exports.regist = function(req, res) {
    return res.render("regist");
  };

  exports.list = function(req, res) {
    return User.find().select("-password").exec(function(err, ret) {
      return res.jsonp(ret);
    });
  };

}).call(this);
