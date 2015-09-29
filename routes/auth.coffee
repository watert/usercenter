User = require("../models/user.coffee")

# Auth
initWithRouter = (router)->
    passport = require("passport")
    LocalStrategy = require("passport-local").Strategy
    passport.serializeUser (user, done)->
        if not user?.id then done("no user")
        done(null, user.id)
    passport.deserializeUser (id, done)->
        User.findByID(id).then (user)->
            done(null, user)
        .fail (err)->
            done(err.message)

    passport.use(new LocalStrategy({
        usernameField:"name"
    },(name, password, done)->
        User.login({name, password}).then (user)->
            done(null, user)
        .fail(done)
    ))

    router.post "/login",
        passport.authenticate('local'),
        (req,res)->
            redirectURI = req.body.redirect or "#{req.baseUrl}/profile"
            res.redirect(redirectURI)
    router.post "/api/login",
        passport.authenticate('local'),
        (req,res)->
            res.ret(req.user)

module.exports = initWithRouter
