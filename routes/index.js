var IndexRoute, User, _, crypto, ejs, express, fs, md5, passport, path, renderPage, renderTemplate;

_ = require("underscore");

express = require("express");

passport = require("passport");

User = require("../models/user.coffee");

ejs = require("ejs");

path = require("path");

fs = require('fs');

crypto = require("crypto");

md5 = function(_str) {
  return crypto.createHash('md5').update(_str).digest('hex');
};

renderTemplate = function(filename, data) {
  var file, filePath, tmpl;
  filePath = path.join(__dirname, filename);
  file = fs.readFileSync(filePath, 'utf8');
  tmpl = ejs.compile(file, {
    cache: true,
    filename: "indexview"
  });
  return tmpl(data);
};

renderPage = function(req, res) {
  var data, html;
  data = _.pick(req, "baseUrl");
  _.extend(data, {
    title: "Common Auth"
  });
  html = renderTemplate("../views/indexview.ejs", data);
  return res.type("html").send(html);
};

IndexRoute = function(options) {
  var apiUtils, checkAuth, decisionAuthCheck, oauthserver, router;
  router = express.Router();
  router.use(passport.initialize());
  router.use(passport.session());
  router.get("/user", function(req, res) {
    return res.json("/user");
  });
  router.use("/public", express["static"](path.join(__dirname, '../public')));
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
  checkAuth = function(req, res, next) {
    var url;
    if (!req.user) {
      console.log("not user");
      url = encodeURIComponent(req.getFullUrl());
      return res.redirect("/?redirect=" + url);
    } else {
      return next();
    }
  };
  oauthserver = require("../oauthserver.coffee");
  router.get("/oauth/authorize", checkAuth, oauthserver.authorize, function(req, res) {
    var data;
    data = {
      transactionID: req.oauth2.transactionID,
      user: req.user._data,
      baseUrl: req.baseUrl
    };
    return res.type("html").send(renderTemplate("../views/decision.ejs", data));
  });
  decisionAuthCheck = function(req, res, next) {
    var url;
    if (!req.user) {
      url = encodeURIComponent(req.getFullUrl());
      return res.retFail("Not logined");
    } else {
      return next();
    }
  };
  router.post("/oauth/authorize/decision", decisionAuthCheck, oauthserver.server.decision());
  router.post("/oauth/token", oauthserver.server.token(), oauthserver.server.errorHandler());
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
