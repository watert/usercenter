_ = require("underscore")
express = require("express")
passport = require("passport")
User = require("../models/user.coffee")
ejs = require("ejs")
path = require("path")
fs = require('fs')
crypto = require("crypto")

{renderPage, renderTemplate} = require("../views/helpers.coffee")
md5 = (_str)->
    crypto.createHash('md5').update(_str).digest('hex')


IndexRoute = (options={})->
    router = express.Router()

    app = options.app or router
    console.log options
    app.use(passport.initialize())
    app.use(passport.session())


    # UI entrance
    router.get "/user",(req,res)->
        res.json "/user"
    router.use("/public",express.static(path.join(__dirname, '../public')));
    router.get "/test", (req,res)->
        html = renderTemplate("../views/index.ejs",{baseUrl:req.baseUrl})
        res.type("html").send(html)
    router.get("/page", renderPage)
    router.get("/", renderPage)
    router.get("/profile", renderPage)
    router.get("/login", renderPage)

    apiUtils = (req,res,next)->

        req.getFullUrl = ()->
            return req.protocol+"://"+req.get("host")+req.originalUrl;

        res.retFail = (err)->
            if _.isString(err)then err = {error:{code:400, message:err}}
            res.status(err.error.code).json(err)
        res.ret = (ret)->
            delete ret._data["password"]
            res.json(data:ret._data)
        res.retPromise = (promise)->
            promise.then(res.ret).fail(res.retFail)
        next()
    # router.use "/api", apiUtils
    router.use(apiUtils)

    require("./auth.coffee")(router)


    # OAuth server
    OAuth = require("./oauth2.coffee")
    checkAuth = OAuth.checkAuth
    router.use("/oauth", OAuth())

    # API for profile
    router.delete "/api/", checkAuth, (req,res)->
        req.user.remove().then((ret)-> {_data:ret})
            .then (ret)->
                req.logOut()
                res.ret(ret)
    router.get "/api/", checkAuth, (req,res)->
        hash = md5(req.user.get("email"))
        req.user.set({"emailHash": hash})
        res.ret(req.user)
    router.put "/api/", checkAuth, (req,res)->
        res.retPromise req.user.set(_.omit(req.body, "_id")).save()
    # Actions
    router.post "/api/logout", (req,res)->
        req.logOut()
        res.json("logout")
    router.post "/api/profile", checkAuth, (req,res)->
        res.ret(req.user)
    router.post "/api/register", (req,res)->
        res.retPromise User.register(req.body)
    return router

module.exports = IndexRoute
