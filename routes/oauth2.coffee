express = require("express")
oauth2orize = require("oauth2orize")
User = require("../models/user.coffee")
q = require("q")
_ = require("underscore")
BaseDoc = require("../models/db.coffee").BaseDoc
{renderPage, renderTemplate} = require("../views/helpers.coffee")
class AccessToken extends BaseDoc
    @store: "oauth_access_token"
class GrantCode extends BaseDoc
    @store: "oauth_grantcode"
class Clients extends BaseDoc
    @store: "oauth_clients"
utils =
    uid:`/*from https://gist.github.com/jed/982883 */ function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}`



checkAuth = (req,res,next)->
    if not req.user
        console.log "not user"
        url = encodeURIComponent(req.getFullUrl())
        res.redirect("/?redirect=#{url}")
    else
        next()
grantCodeMethod = (client, redirectURI, user, ares, done)->
    code = utils.uid();
    ac = new GrantCode({code, user_id:user.id, redirectURI, client_id:commonClient.id})
    ac.save().then (doc)->
        done(null, code)
    .fail (err)-> done(err)
exchangeTokenMethod = (client, code, redirectURI, done)->
    GrantCode.findOne({code}).then (doc)->
        console.log "find grantCode by code",code, doc
        grantDoc = doc._data
        user_id = grantDoc.user_id
        if not doc.id
            done(null, false, "authcode #{code} not found")
            return q.reject("authcode #{code} not found")
        else
            tokenData =
                token: utils.uid()+utils.uid()+utils.uid()+utils.uid()
                client_id: grantDoc.client_id
                profile: {name:"hello"}
                user_id: user_id
            # console.log "try withwith tokenData", tokenData
            return tokenData
    .then (tokenData)->
        GrantCode.remove({code}).then ->
            (new AccessToken(tokenData)).save()
    .then (tokenDoc)->
        # console.log "done with token", tokenDoc._data.token
        data = tokenDoc._data
        return _.pick(tokenDoc._data, "token", "user_id")
    .then (data)->
        console.log "User.findByID", data
        User.findByID(data.user_id).then (userDoc)->
            data.profile = _.omit(userDoc._data,"password")
            console.log "find user",data
            done(null, data)
    .fail (err)->
        console.log("fail err",err)
        done("exchangeToken err")

commonClient = {id:'-1', type:"unknown"}

middleware = (options)->

    passport = require("passport")
    BasicStrategy = require("passport-http").BasicStrategy
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
    passport.use new BasicStrategy (username, password, done)->
        done(null,commonClient)
    passport.use new ClientPasswordStrategy (clientID, clientSecret, done)->
        done(null,commonClient)

    server = oauth2orize.createServer()

    server.serializeClient (client, done)->
        console.log "serialize client",client,commonClient.id
        done(null, commonClient.id)
    server.deserializeClient (id, done)->
        console.log "deserialize client",id
        done(null, commonClient)

    server.grant(oauth2orize.grant.code(grantCodeMethod))
    server.exchange(oauth2orize.exchange.code(exchangeTokenMethod))

    authorize = server.authorize (clientID, redirectURI, done)->
        console.log "server.authorize", clientID, redirectURI
        done(null, commonClient, redirectURI)
    router = express.Router()
    router.get "/authorize", checkAuth, authorize, (req,res)->
        data = transactionID: req.oauth2.transactionID, user:req.user._data, baseUrl: req.baseUrl
        res.type("html").send renderTemplate("../views/decision.ejs", data)

    decisionAuthCheck = (req,res,next)->
        if not req.user
            url = encodeURIComponent(req.getFullUrl())
            res.retFail("Not logined")
        else next()
    router.post "/authorize/decision",decisionAuthCheck,server.decision()
    router.post("/token", server.token(), server.errorHandler())

    return router

_.extend(middleware, {checkAuth})
module.exports = middleware
