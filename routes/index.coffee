_ = require("underscore")
express = require("express")
passport = require("passport")
User = require("../models/user.coffee")
ejs = require("ejs")
path = require("path")
fs = require('fs')
crypto = require("crypto")

md5 = (_str)->
    crypto.createHash('md5').update(_str).digest('hex')
renderTemplate = (filename, data)->
    filePath = path.join(__dirname,filename)
    file = fs.readFileSync(filePath, 'utf8')
    tmpl = ejs.compile(file, cache:yes, filename:"indexview")
    return tmpl(data)
renderPage = (req,res)->
    # return res.json(req.url)
    data = _.pick(req,"baseUrl")
    _.extend(data, {title:"Common Auth"})
    html = renderTemplate("../views/indexview.ejs",data)
    res.type("html").send(html)

IndexRoute = (options)->
    router = express.Router()

    router.use(passport.initialize())
    router.use(passport.session())


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

    # APIs with session auth
    #
    # sessionAuth = passport.authenticate('local')

    checkAuth = (req,res,next)->
        if not req.user
            console.log "not user"
            url = encodeURIComponent(req.getFullUrl())
            res.redirect("/?redirect=#{url}")
        else
            next()


    # OAuth server
    oauthserver = require("../oauthserver.coffee")
    # app.get "/oauth/authorize/", (req,res)->
    #     res.json(req.user)
    # app.get "/api/xxx/", checkAuth, (req,res)->
    #     res.json(req.user)
    router.get "/oauth/authorize", checkAuth, oauthserver.authorize, (req,res)->
        data = transactionID: req.oauth2.transactionID, user:req.user._data, baseUrl: req.baseUrl
        res.type("html").send renderTemplate("../views/decision.ejs", data)
    decisionAuthCheck = (req,res,next)->
        if not req.user
            url = encodeURIComponent(req.getFullUrl())
            res.retFail("Not logined")
        else next()
    router.post "/oauth/authorize/decision",decisionAuthCheck,oauthserver.server.decision()
    router.post("/oauth/token", oauthserver.server.token(), oauthserver.server.errorHandler())

    # API for profile
    router.delete "/api/", checkAuth, (req,res)->
        req.user.remove().then((ret)-> {_data:ret})
            .then (ret)->
                req.logOut()
                res.ret(ret)
    router.get "/api/", checkAuth, (req,res)->
        # console.log "GET /api", req.user
        # console.log "get /api/",req.user
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
