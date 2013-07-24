
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

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/user/profile', user.profile);
app.get('/user/login', user.login);
app.get('/user/regist', user.regist);
app.post('/login', user.loginPost);
app.post('/login', function(req,res){
	res.redirect("/user/profile");
});
app.post('/regist', user.registPost);

app.all('/api/users/', user.api);
app.all('/api/users/:id', user.api);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
