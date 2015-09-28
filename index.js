var Auth, User, _, app, bodyParser, crypto, ejs, express, fs, md5, passport, path, q, renderPage, renderTemplate, server, session;

require('coffee-script/register');

_ = require("underscore");

express = require("express");

q = require("q");

User = require("./models/user.coffee");

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
  html = renderTemplate("views/indexview.ejs", data);
  return res.type("html").send(html);
};

Auth = function(options) {
  var OAuth2Strategy, apiUtils, checkAuth, oauthserver, passport, router;
  router = express.Router();
  router.get("/user", function(req, res) {
    return res.json("/user");
  });
  router.use("/public", express["static"](path.join(__dirname, './public')));
  router.get("/test", function(req, res) {
    var html;
    html = renderTemplate("views/index.ejs", {
      baseUrl: req.baseUrl
    });
    return res.type("html").send(html);
  });
  router.get("/page", renderPage);
  router.get("/", renderPage);
  router.get("/profile", renderPage);
  router.get("/login", renderPage);
  apiUtils = function(req, res, next) {
    res.retFail = function(err) {
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
  require("./routes/auth.coffee")(router);
  checkAuth = function(req, res, next) {
    var url;
    if (!req.user) {
      url = req.protocol + "://" + req.get("host") + req.originalUrl;
      url = encodeURIComponent(url);
      return res.redirect("/?redirect=" + url);
    } else {
      return next();
    }
  };
  passport = require("passport");
  oauthserver = require("./oauthserver.coffee");
  app.get("/oauth/authorize", checkAuth, oauthserver.authorize, function(req, res) {
    var data;
    data = {
      transactionID: req.oauth2.transactionID,
      user: req.user._data,
      baseUrl: req.baseUrl
    };
    return res.type("html").send(renderTemplate("views/decision.ejs", data));
  });
  app.post("/oauth/authorize/decision", checkAuth, oauthserver.server.decision());
  app.post("/oauth/token", oauthserver.server.token(), oauthserver.server.errorHandler());
  app.post("/oauth/token/", oauthserver.server.token(), oauthserver.server.errorHandler());
  OAuth2Strategy = require("passport-oauth2");
  passport.use(new OAuth2Strategy({
    authorizationURL: "http://localhost:3000/oauth/authorize",
    tokenURL: 'http://localhost:3000/oauth/token',
    clientID: "EXAMPLE CLIENT ID",
    clientSecret: "EXAMPLE CLIENT SECRET",
    callbackURL: "/client/"
  }, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }));
  router.get("/client", passport.authenticate('oauth2'), function(req, res) {
    return res.json({
      "page": "client",
      user: req.user
    });
  });
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


/* run directly, run as root router */

if (require.main === module) {
  bodyParser = require('body-parser');
  session = require('express-session');
  app = express();
  module.exports = server;
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(require('compression')());
  app.use(require('cookie-parser')());
  app.use(session({
    secret: "auth"
  }));
  passport = require("passport");
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(require('morgan')('dev'));
  app.use("/", Auth());
  server = app.listen(3000);
  console.log("listen 3000");
} else {
  module.exports = Auth;
}
