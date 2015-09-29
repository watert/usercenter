var OAuth2Strategy, app, bodyParser, checkAuth, express, passport, request, server, serverBase, session, users;

express = require("express");

passport = require("passport");

OAuth2Strategy = require("passport-oauth2");

request = require("request");

serverBase = "http://localhost:3000/oauth";

passport.use(new OAuth2Strategy({
  authorizationURL: serverBase + "/authorize",
  tokenURL: serverBase + "/token",
  clientID: "EXAMPLE CLIENT ID",
  clientSecret: "EXAMPLE CLIENT SECRET",
  callbackURL: "/client/"
}, function(accessToken, refreshToken, profile, done) {
  console.log("oauth2 passed", accessToken, profile);
  return done(null, accessToken);
}));

users = {};

passport.serializeUser(function(user, done) {
  console.log("passport.serializeUser", user);
  if (!user.token) {
    done("no user");
  }
  users[user.token] = user;
  return done(null, user.token);
});

passport.deserializeUser(function(id, done) {
  return done(null, users[id]);
});

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

app.use(function(req, res, next) {
  var user;
  if (user = session.user) {
    req.user = user;
  }
  return next();
});

checkAuth = function(req, res, next) {
  if (!req.user) {
    return passport.authenticate('oauth2')(req, res, next);
  } else {
    console.log("setsession", req.user);
    session.user = req.user;
    return next();
  }
};

app.get("/client/login", checkAuth, function(req, res) {
  return res.redirect("/client");
});

app.get("/logout", function(req, res) {
  req.logOut();
  console.log(req.session);
  req.session.destroy();
  return res.json("logout");
});

app.get("/client", checkAuth, function(req, res, next) {
  return res.json({
    "page": "client",
    user: req.user
  });
});

server = app.listen(3001);

console.log("listen 3001");
