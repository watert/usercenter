
/**
 * Module dependencies.
 */
require("coffee-script");
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require("mongoose");

var app = express();
mongoose.connect("localhost");
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
// app.set('view cache', false);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('some secret'));
app.use(express.cookieSession());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Portal
app.get('/', routes.index);

// Basic User Functions
app.get('/user/profile', user.profile);
app.get('/user/regist', user.regist);
app.post('/user/regist', user.registPost);
app.get('/user/login', user.login);
app.post('/user/login', user.loginPost);
app.post('/user/login', function(req,res){
	res.redirect("/user/profile");
});

// User Management
app.get('/admin', function(req,res){ res.render("admin"); });

// API part
app.all('/api/users/', user.api);
app.all('/api/users/:id', user.api);
//SSO part
require("./routes/sso").init(app,"/sso");

app.all("/test/*",require("./routes/test").all);
var ssoRouter = require("./src_clients/UserCenterClient")
			.expressRouter({host:"waterwu.me:3003"});
app.get("/ssotest",ssoRouter);
app.get("/ssotest",function(req,res){
	res.json("hello,"+req.session.user.name);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
