var Auth, User, _, app, bodyParser, crypto, ejs, express, fs, md5, oauth2orize, path, q, renderPage, renderTemplate, server, session;

require('coffee-script/register');

_ = require("underscore");

express = require("express");

q = require("q");

User = require("./models/user.coffee");

ejs = require("ejs");

path = require("path");

fs = require('fs');

crypto = require("crypto");

oauth2orize = require("oauth2orize");

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
  var LocalStrategy, checkAuth, passport, router, sessionAuth;
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
  router.use("/api", function(req, res, next) {
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
  });
  passport = require("passport");
  LocalStrategy = require("passport-local").Strategy;
  router.use(passport.initialize());
  router.use(passport.session());
  passport.serializeUser(function(user, done) {
    return done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    return User.findByID(id).then(function(user) {
      return done(null, user);
    }).fail(function(err) {
      return done(err.message);
    });
  });
  passport.use(new LocalStrategy({
    usernameField: "name"
  }, function(name, password, done) {
    return User.login({
      name: name,
      password: password
    }).then(function(user) {
      return done(null, user);
    }).fail(done);
  }));
  router.post("/api/login", passport.authenticate('local'), function(req, res) {
    return res.ret(req.user);
  });
  sessionAuth = passport.authenticate('local');
  checkAuth = function(req, res, next) {
    if (!req.user) {
      res.retFail({
        error: {
          message: "not authorized",
          code: "406"
        }
      });
    }
    return next();
  };
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
  app.use(session({
    secret: "auth",
    resave: true,
    saveUninitialized: false
  }));
  app.use(require('morgan')('dev'));
  app.use("/", Auth());
  server = app.listen(3000);
  console.log("listen 3000");
} else {
  module.exports = Auth;
}
