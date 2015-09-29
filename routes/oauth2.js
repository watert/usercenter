var AccessToken, BaseDoc, Clients, GrantCode, User, _, checkAuth, commonClient, exchangeTokenMethod, express, grantCodeMethod, middleware, oauth2orize, q, ref, renderPage, renderTemplate, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

express = require("express");

oauth2orize = require("oauth2orize");

User = require("../models/user.coffee");

q = require("q");

_ = require("underscore");

BaseDoc = require("../models/db.coffee").BaseDoc;

ref = require("../views/helpers.coffee"), renderPage = ref.renderPage, renderTemplate = ref.renderTemplate;

AccessToken = (function(superClass) {
  extend(AccessToken, superClass);

  function AccessToken() {
    return AccessToken.__super__.constructor.apply(this, arguments);
  }

  AccessToken.store = "oauth_access_token";

  return AccessToken;

})(BaseDoc);

GrantCode = (function(superClass) {
  extend(GrantCode, superClass);

  function GrantCode() {
    return GrantCode.__super__.constructor.apply(this, arguments);
  }

  GrantCode.store = "oauth_grantcode";

  return GrantCode;

})(BaseDoc);

Clients = (function(superClass) {
  extend(Clients, superClass);

  function Clients() {
    return Clients.__super__.constructor.apply(this, arguments);
  }

  Clients.store = "oauth_clients";

  return Clients;

})(BaseDoc);

utils = {
  uid: /*from https://gist.github.com/jed/982883 */ function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}
};

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
    return User.findByID(data.user_id).then(function(userDoc) {
      data.profile = _.omit(userDoc._data, "password");
      return done(null, data);
    });
  }).fail(function(err) {
    return done("exchangeToken err");
  });
};

commonClient = {
  id: '-1',
  type: "unknown"
};

middleware = function(options) {
  var BasicStrategy, ClientPasswordStrategy, authorize, clients, decisionAuthCheck, passport, router, server;
  passport = require("passport");
  BasicStrategy = require("passport-http").BasicStrategy;
  ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
  passport.use(new BasicStrategy(function(username, password, done) {
    return done(null, commonClient);
  }));
  passport.use(new ClientPasswordStrategy(function(clientID, clientSecret, done) {
    console.log("ClientPasswordStrategy", clientID, clientSecret);
    return done(null, commonClient);
  }));
  server = oauth2orize.createServer();
  clients = {};
  server.serializeClient(function(client, done) {
    console.log("serialize client", client, commonClient.id);
    clients[client.clientID] = client;
    return done(null, client.clientID);
  });
  server.deserializeClient(function(id, done) {
    console.log("deserialize client", id);
    return done(null, clients[id] || commonClient);
  });
  server.grant(oauth2orize.grant.code(grantCodeMethod));
  server.exchange(oauth2orize.exchange.code(exchangeTokenMethod));
  authorize = server.authorize(function(clientID, redirectURI, done) {
    console.log("server.authorize", clientID, redirectURI);
    return done(null, {
      clientID: clientID,
      redirectURI: redirectURI
    }, redirectURI);
  });
  router = express.Router();
  router.get("/authorize", checkAuth, authorize, function(req, res) {
    var data;
    console.log("/authorize", req.oauth2);
    data = _.pick(req.oauth2, "transactionID", "client");
    data = _.extend(data, {
      user: req.user._data,
      baseUrl: req.baseUrl
    });
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
  router.post("/authorize/decision", decisionAuthCheck, server.decision());
  router.post("/token", server.token(), server.errorHandler());
  return router;
};

_.extend(middleware, {
  checkAuth: checkAuth
});

module.exports = middleware;
