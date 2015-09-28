var AccessToken, BasicStrategy, ClientPasswordStrategy, Clients, GrantCode, User, _, authorize, commonClient, exchangeTokenMethod, grantCodeMethod, oauth2orize, passport, q, server, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

oauth2orize = require("oauth2orize");

User = require("./models/user.coffee");

q = require("q");

_ = require("underscore");

AccessToken = (function(superClass) {
  extend(AccessToken, superClass);

  function AccessToken() {
    return AccessToken.__super__.constructor.apply(this, arguments);
  }

  AccessToken.store = "oauth_access_token";

  return AccessToken;

})(require("./models/db.coffee").BaseDoc);

GrantCode = (function(superClass) {
  extend(GrantCode, superClass);

  function GrantCode() {
    return GrantCode.__super__.constructor.apply(this, arguments);
  }

  GrantCode.store = "oauth_grantcode";

  return GrantCode;

})(require("./models/db.coffee").BaseDoc);

Clients = (function(superClass) {
  extend(Clients, superClass);

  function Clients() {
    return Clients.__super__.constructor.apply(this, arguments);
  }

  Clients.store = "oauth_clients";

  return Clients;

})(require("./models/db.coffee").BaseDoc);

utils = {
  uid: /*from https://gist.github.com/jed/982883 */ function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}
};

server = oauth2orize.createServer();

commonClient = {
  id: '-1',
  type: "unknown"
};

server.serializeClient(function(client, done) {
  console.log("serialize client", client, commonClient.id);
  return done(null, commonClient.id);
});

server.deserializeClient(function(id, done) {
  console.log("deserialize client", id);
  return done(null, commonClient);
});

grantCodeMethod = function(client, redirectURI, user, ares, done) {
  var ac, code;
  code = utils.uid();
  ac = new GrantCode({
    code: code,
    user_id: user.id,
    redirectURI: redirectURI,
    client_id: commonClient.id
  });
  return ac.save().then(function(doc) {
    return done(null, code);
  }).fail(function(err) {
    return done(err);
  });
};

exchangeTokenMethod = function(client, code, redirectURI, done) {
  return GrantCode.findOne({
    code: code
  }).then(function(doc) {
    var grantDoc, tokenData, user_id;
    console.log("find grantCode by code", code, doc);
    grantDoc = doc._data;
    user_id = grantDoc.user_id;
    if (!doc.id) {
      done(null, false, "authcode " + code + " not found");
      return q.reject("authcode " + code + " not found");
    } else {
      tokenData = {
        token: utils.uid() + utils.uid() + utils.uid() + utils.uid(),
        client_id: grantDoc.client_id,
        profile: {
          name: "hello"
        },
        user_id: user_id
      };
      return tokenData;
    }
  }).then(function(tokenData) {
    return GrantCode.remove({
      code: code
    }).then(function() {
      return (new AccessToken(tokenData)).save();
    });
  }).then(function(tokenDoc) {
    var data;
    data = tokenDoc._data;
    return _.pick(tokenDoc._data, "token", "user_id");
  }).then(function(data) {
    console.log("User.findByID", data);
    return User.findByID(data.user_id).then(function(userDoc) {
      data.profile = _.omit(userDoc._data, "password");
      console.log("find user", data);
      return done(null, data);
    });
  }).fail(function(err) {
    console.log("fail err", err);
    return done("exchangeToken err");
  });
};

server.grant(oauth2orize.grant.code(grantCodeMethod));

server.exchange(oauth2orize.exchange.code(exchangeTokenMethod));

passport = require("passport");

BasicStrategy = require("passport-http").BasicStrategy;

ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

passport.use(new BasicStrategy(function(username, password, done) {
  return done(null, commonClient);
}));

passport.use(new ClientPasswordStrategy(function(clientID, clientSecret, done) {
  return done(null, commonClient);
}));

authorize = server.authorize(function(clientID, redirectURI, done) {
  console.log("server.authorize", clientID, redirectURI);
  return done(null, commonClient, redirectURI);
});

module.exports = {
  server: server,
  authorize: authorize
};
