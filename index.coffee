require 'coffee-script/register'
_ = require("underscore")
express = require("express")
q = require("q")
User = require("./models/user.coffee")
ejs = require("ejs")
path = require("path")
fs = require('fs')
crypto = require("crypto")
oauth2orize = require("oauth2orize")

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
    html = renderTemplate("views/indexview.ejs",data)
    res.type("html").send(html)

Auth = (options)->
    router = express.Router()


    router.get "/user",(req,res)->
        res.json "/user"
    router.use("/public",express.static(path.join(__dirname, './public')));
    router.get "/test", (req,res)->
        html = renderTemplate("views/index.ejs",{baseUrl:req.baseUrl})
        res.type("html").send(html)
    router.get("/page", renderPage)
    router.get("/", renderPage)


    router.use "/api", (req,res,next)->
        res.retFail = (err)->
            res.status(err.error.code).json(err)
        res.ret = (ret)->
            delete ret._data["password"]
            res.json(data:ret._data)
        res.retPromise = (promise)->
            promise.then(res.ret).fail(res.retFail)
        next()

    # Auth
    passport = require("passport")
    LocalStrategy = require("passport-local").Strategy
    router.use(passport.initialize());
    router.use(passport.session());
    passport.serializeUser (user, done)->
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
    router.post "/api/login",
        passport.authenticate('local'),
        (req,res)->
            res.ret(req.user)

    # APIs with session auth
    sessionAuth = passport.authenticate('local')
    checkAuth = (req,res,next)->
        if not req.user
            res.retFail({error:{message:"not authorized",code:"406"}})
        next()
    router.delete "/api/", checkAuth, (req,res)->
        req.user.remove().then((ret)-> {_data:ret})
            .then (ret)->
                req.logOut()
                res.ret(ret)
    router.get "/api/", checkAuth, (req,res)->
        # console.log "GET /api", req.user
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


### run directly, run as root router ###
if require.main is module
    bodyParser = require('body-parser')
    session = require('express-session')
    app = express()
    module.exports = server
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(require('compression')());
    app.use(session({secret:"auth",resave:true, saveUninitialized:false}));
    app.use(require('morgan')('dev'));
    app.use("/",Auth())
    server = app.listen(3000)
    console.log("listen 3000")

else
    module.exports = Auth
