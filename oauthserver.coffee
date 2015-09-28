oauth2orize = require("oauth2orize")
class AccessToken extends require("./models/db.coffee").BaseDoc
    @store: "oauth_access_token"
class GrantCode extends require("./models/db.coffee").BaseDoc
    @store: "oauth_grantcode"
class Clients extends require("./models/db.coffee").BaseDoc
    @store: "oauth_clients"
utils =
    uid:`/*from https://gist.github.com/jed/982883 */ function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}`

server = oauth2orize.createServer()

commonClient = {id:'-1', type:"unknown"}
server.serializeClient (client, done)->
    console.log "serialize client",client,commonClient.id
    done(null, commonClient.id)
server.deserializeClient (id, done)->
    console.log "deserialize client",id
    done(null, commonClient)


grantCodeMethod = (client, redirectURI, user, ares, done)->
    code = utils.uid();
    console.log "grant code", code
    # ac = GrantCode.save({code, user_id:user._id, redirectURI, client_id:client._id}).then ->
    ac = new GrantCode({code, user_id:user._id, redirectURI, client_id:client._id})
    ac.save().then (doc)->
        console.log "successfully generate grant code", code
        done(null, code)
    .fail (err)-> done(err)
exchangeTokenMethod = (client, code, redirectURI, done)->
    console.log "exchangeTokenMethod",client, code
    GrantCode.findOne({code}).then (doc)->
        grantDoc = doc._data
        if not grantDoc then return done("no grant authcode founded", false)
        if client.id isnt grantDoc.client_id then return done("client_id wrong",false)
        if redirectURI isnt grantDoc.redirectURI then return done("redirectURI wrong", false)
        tokenData =
            token: utils.uid()+utils.uid()+utils.uid()+utils.uid()
            client_id: grantDoc.client_id
            user_id: grantDoc.user_id
        GrantCode.remove({code}).then ->
            token = utils.uid()+utils.uid()+utils.uid()+utils.uid()
            (new AccessToken(tokenData)).save()
        .then (tokenDoc)->
            done(null, tokenDoc._data)
        .fail -> done("delete grantcode and save token err")

server.grant(oauth2orize.grant.code(grantCodeMethod))
server.exchange(oauth2orize.exchange.code(exchangeTokenMethod))


authorize = server.authorize (clientID, redirectURI, done)->
    console.log "server.authorize", clientID, redirectURI
    done(null, commonClient, redirectURI)

module.exports = {server, authorize}
