var OAuth2Strategy, app, bodyParser, express, passport, request, server, serverHost, session;

express = require("express");

passport = require("passport");

OAuth2Strategy = require("passport-oauth2");

request = require("request");

serverHost = "http://localhost:3000";

passport.use(new OAuth2Strategy({
  authorizationURL: serverHost + "/oauth/authorize",
  tokenURL: serverHost + "/oauth/token",
  clientID: "EXAMPLE CLIENT ID",
  clientSecret: "EXAMPLE CLIENT SECRET",
  callbackURL: "/client/login/"
}, function(accessToken, refreshToken, profile, done) {
  console.log("oauth2 passed", accessToken, profile);
  return done(null, accessToken);
}));

passport.serializeUser(function(user, done) {
  console.log("passport.serializeUser", user);
  if (!user.token) {
    done("no user");
  }
  return done(null, user.token);
});

passport.deserializeUser(function(id, done) {
  return done(null, {
    token: id
  });
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

app.get("/client/login", passport.authenticate('oauth2'), function(req, res) {
  session.user = req.user;
  console.log("req", req.user);
  return res.redirect("/client");
});

app.get("/client", function(req, res) {
  console.log("authorized client", req.oauth2);
  return res.json({
    "page": "client",
    user: req.user
  });
});

server = app.listen(3001);

console.log("listen 3001");
