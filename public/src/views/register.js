var $, Backbone, RegisterView, User, _, deparam,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Backbone = require("backbone");

$ = require("jquery");

User = require("../models/user.coffee");

deparam = require("jquery-deparam");

RegisterView = (function(superClass) {
  extend(RegisterView, superClass);

  function RegisterView() {
    return RegisterView.__super__.constructor.apply(this, arguments);
  }

  RegisterView.prototype.events = {
    "submit": function(e) {
      var data;
      e.preventDefault();
      data = deparam(this.$("form").serialize());
      return User.register(data).then(function(user) {
        alert("Register Successfully");
        return User.login(data);
      }).fail(function(xhr) {
        return alert(xhr.responseJSON.error.message);
      }).then(function() {
        return App.router.navigate("profile", {
          trigger: true
        });
      });
    },
    "click .btn-login": function() {
      return App.router.navigate("login", {
        trigger: true
      });
    }
  };

  RegisterView.prototype.initialize = function() {
    return this.name = "title";
  };

  RegisterView.prototype.tmpl = _.template("<form method=\"post\" data-action=\"register\" class=\"form form-register\">\n    <h2> User Register </h2>\n    <input type=\"text\" name=\"name\" placeholder=\"Name\"/>\n    <input type=\"email\" name=\"email\" placeholder=\"Email\"/>\n    <input type=\"password\" name=\"password\" placeholder=\"Password\"/>\n    <div class=\"actions\">\n        <button class=\"btn btn-submit\" type=\"submit\">Register</button>\n        <a class=\"btn btn-login btn-link\" href=\"javascript:void(0)\"> Already has account </a>\n    </div>\n</form>");

  RegisterView.prototype.className = "view-user-index";

  RegisterView.prototype.render = function(data) {
    var html;
    if (data == null) {
      data = {};
    }
    html = this.tmpl(data);
    return this.$el.html(html);
  };

  return RegisterView;

})(Backbone.View);

module.exports = RegisterView;
