var IndexRoute, User, _, crypto, ejs, express, fs, md5, passport, path, ref, renderPage, renderTemplate;

_ = require("underscore");

express = require("express");

passport = require("passport");

User = require("../models/user.coffee");

ejs = require("ejs");

path = require("path");

fs = require('fs');

crypto = require("crypto");

ref = require("../views/helpers.coffee"), renderPage = ref.renderPage, renderTemplate = ref.renderTemplate;

md5 = function(_str) {
  return crypto.createHash('md5').update(_str).digest('hex');
};

IndexRoute = function(options) {
  var OAuth, apiUtils, app, checkAuth, router;
  if (options == null) {
    options = {};
  }
  router = express.Router();
  router.User = User;
  app = options.app || router;
  app.use(passport.initialize());
  app.use(passport.session());
  router.use("/public", express["static"](path.join(__dirname, '../public')));
  OAuth = require("./oauth2.coffee");
  checkAuth = OAuth.checkAuth;
  router.use("/oauth", OAuth());
  router.get("/test", function(req, res) {
    var html;
    html = renderTemplate("../views/index.ejs", {
      baseUrl: req.baseUrl
    });
    return res.type("html").send(html);
  });
  router.get("/page", renderPage);
  router.get("/", renderPage);
  router.get("/profile", renderPage);
  router.get("/login", renderPage);
  router.get("/logout", function(req, res) {
    req.logOut();
    return req.session.destroy(function() {
      return res.redirect(req.baseUrl + "/login");
    });
  });
  apiUtils = function(req, res, next) {
    req.getFullUrl = function() {
      return req.protocol + "://" + req.get("host") + req.originalUrl;
    };
    res.retFail = function(err) {
      if (_.isString(err)) {
        err = {
          error: {
            code: 400,
            message: err
          }
        };
      }
      return res.status(err.error.code).json(err);
    };
    res.ret = function(ret) {
      delete ret._data["password"];
      return res.json({
        data: ret._data
      });
    };
    res.retPromise = function(promise) {
      return promise.then(res.ret).fail(res.retFail);
    };
    return next();
  };
  router.use(apiUtils);
  require("./auth.coffee")(router);
  router["delete"]("/api/", checkAuth, function(req, res) {
    return req.user.remove().then(function(ret) {
      return {
        _data: ret
      };
    }).then(function(ret) {
      req.logOut();
      return res.ret(ret);
    });
  });
  router.get("/api/", checkAuth, function(req, res) {
    var hash;
    hash = md5(req.user.get("email"));
    req.user.set({
      "emailHash": hash
    });
    return res.ret(req.user);
  });
  router.put("/api/", checkAuth, function(req, res) {
    return res.retPromise(req.user.set(_.omit(req.body, "_id")).save());
  });
  router.post("/api/logout", function(req, res) {
    req.logOut();
    return res.json("logout");
  });
  router.post("/api/profile", checkAuth, function(req, res) {
    return res.ret(req.user);
  });
  router.post("/api/register", function(req, res) {
    return res.retPromise(User.register(req.body));
  });
  return router;
};

module.exports = IndexRoute;
