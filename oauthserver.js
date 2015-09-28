var AccessToken, Clients, GrantCode, authorize, commonClient, exchangeTokenMethod, grantCodeMethod, oauth2orize, server, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

oauth2orize = require("oauth2orize");

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
  console.log("grant code", code);
  ac = new GrantCode({
    code: code,
    user_id: user._id,
    redirectURI: redirectURI,
    client_id: client._id
  });
  return ac.save().then(function(doc) {
    console.log("successfully generate grant code", code);
    return done(null, code);
  }).fail(function(err) {
    return done(err);
  });
};

exchangeTokenMethod = function(client, code, redirectURI, done) {
  console.log("exchangeTokenMethod", client, code);
  return GrantCode.findOne({
    code: code
  }).then(function(doc) {
    var grantDoc, tokenData;
    grantDoc = doc._data;
    if (!grantDoc) {
      return done("no grant authcode founded", false);
    }
    if (client.id !== grantDoc.client_id) {
      return done("client_id wrong", false);
    }
    if (redirectURI !== grantDoc.redirectURI) {
      return done("redirectURI wrong", false);
    }
    tokenData = {
      token: utils.uid() + utils.uid() + utils.uid() + utils.uid(),
      client_id: grantDoc.client_id,
      user_id: grantDoc.user_id
    };
    return GrantCode.remove({
      code: code
    }).then(function() {
      var token;
      token = utils.uid() + utils.uid() + utils.uid() + utils.uid();
      return (new AccessToken(tokenData)).save();
    }).then(function(tokenDoc) {
      return done(null, tokenDoc._data);
    }).fail(function() {
      return done("delete grantcode and save token err");
    });
  });
};

server.grant(oauth2orize.grant.code(grantCodeMethod));

server.exchange(oauth2orize.exchange.code(exchangeTokenMethod));

authorize = server.authorize(function(clientID, redirectURI, done) {
  console.log("server.authorize", clientID, redirectURI);
  return done(null, commonClient, redirectURI);
});

module.exports = {
  server: server,
  authorize: authorize
};
