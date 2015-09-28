var User, initWithRouter;

User = require("../models/user.coffee");

initWithRouter = function(router) {
  var LocalStrategy, passport;
  passport = require("passport");
  LocalStrategy = require("passport-local").Strategy;
  passport.serializeUser(function(user, done) {
    if (!(user != null ? user.id : void 0)) {
      done("no user");
    }
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
  router.post("/login", passport.authenticate('local'), function(req, res) {
    var redirectURI;
    redirectURI = req.body.redirect || "/profile";
    return res.redirect(redirectURI);
  });
  return router.post("/api/login", passport.authenticate('local'), function(req, res) {
    return res.ret(req.user);
  });
};

module.exports = initWithRouter;
