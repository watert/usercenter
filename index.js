var MainRoute, app, bodyParser, express, q, server, session;

require('coffee-script/register');

express = require("express");

q = require("q");

MainRoute = require("./routes/index.coffee");

module.exports = MainRoute;


/* run directly, run as root router */

if (require.main === module) {
  bodyParser = require('body-parser');
  session = require('express-session');
  app = express();
  module.exports = server;
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(require('compression')());
  app.use(require('cookie-parser')());
  app.use(session({
    secret: "auth"
  }));
  app.use(require('morgan')('dev'));
  app.use("/", MainRoute());
  server = app.listen(3000);
  console.log("listen 3000");
}
