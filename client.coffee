express = require("express")
passport = require("passport")
OAuth2Strategy = require("passport-oauth2")
request = require("request")

serverHost = "http://localhost:3000"
passport.use(new OAuth2Strategy({
    authorizationURL:"#{serverHost}/oauth/authorize"
    tokenURL: "#{serverHost}/oauth/token"
    clientID: "EXAMPLE CLIENT ID"
    clientSecret: "EXAMPLE CLIENT SECRET"
    callbackURL: "/client/login/"
},(accessToken, refreshToken, profile, done)->
    console.log "oauth2 passed", accessToken, profile
    done(null, accessToken)
));
passport.serializeUser (user, done)->
    console.log "passport.serializeUser", user
    if not user.token then done("no user")
    done(null, user.token)
passport.deserializeUser (id, done)->
    done null, {token:id}

bodyParser = require('body-parser')
session = require('express-session')
app = express()
module.exports = server
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(require('compression')());
app.use(require('cookie-parser')())
app.use(session({secret:"auth"}));
passport = require("passport")
app.use(passport.initialize());
app.use(passport.session());

app.use(require('morgan')('dev'));
# app.use("/",Auth())

app.use (req,res,next)->
    if user = session.user then req.user = user
    next()
app.get "/client/login",passport.authenticate('oauth2'), (req,res)->
    session.user = req.user
    console.log "req", req.user
    res.redirect("/client")
app.get "/client",(req,res)->
    console.log "authorized client", req.oauth2
    res.json({"page":"client", user:req.user})


server = app.listen(3001)
console.log("listen 3001")
