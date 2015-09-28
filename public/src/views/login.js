var Backbone, LoginView, User, _, deparam,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Backbone = require("backbone");

deparam = require("jquery-deparam");

User = require("../models/user.coffee");

LoginView = (function(superClass) {
  extend(LoginView, superClass);

  function LoginView() {
    return LoginView.__super__.constructor.apply(this, arguments);
  }

  LoginView.prototype.events = {
    "click .btn-register": function() {
      return App.router.navigate("register", {
        trigger: true
      });
    }
  };

  LoginView.prototype.initialize = function() {
    return this.name = "title";
  };

  LoginView.prototype.tmpl = _.template("<form method=\"post\" action=\"login\" class=\"form form-login\">\n    <h2> User Login </h2>\n    <input type=\"hidden\" name=\"redirect\" value=\"\" />\n    <input type=\"text\" value=\"test\" name=\"name\" placeholder=\"Name\"/>\n    <input type=\"password\" value=\"test\" name=\"password\" placeholder=\"Password\"/>\n    <div class=\"actions\">\n        <button class=\"btn btn-submit\" type=\"submit\">Login</button>\n        <button class=\"btn btn-register\" type=\"button\">Register</button>\n    </div>\n</form>");

  LoginView.prototype.className = "view-user-index";

  LoginView.prototype.render = function(data) {
    var html, query;
    if (data == null) {
      data = {};
    }
    html = this.tmpl(data);
    this.$el.html(html);
    query = $.deparam(location.search.slice(1));
    return this.$("[name=redirect]").val(query.redirect);
  };

  return LoginView;

})(Backbone.View);

module.exports = LoginView;
