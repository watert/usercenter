var Backbone, ProfileView, User, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Backbone = require("backbone");

User = require("../models/user.coffee");

ProfileView = (function(superClass) {
  extend(ProfileView, superClass);

  function ProfileView() {
    return ProfileView.__super__.constructor.apply(this, arguments);
  }

  ProfileView.prototype.events = {
    "click .btn-logout": function() {
      return location.href = "logout";
    }
  };

  ProfileView.prototype.tmpl = _.template("<div class=\"profile\">\n    <div class=\"avatar\">\n        <img src=\"http://www.gravatar.com/avatar/<%=emailHash%>?s=200\" alt=\"\" />\n        <h3> <%=name%> </h3>\n    </div>\n    <div class=\"info\">\n        <div class=\"small\"> Email </div>\n        <p><%=email%></p>\n    </div>\n    <div class=\"actions\">\n        <button class=\"btn btn-logout\">Logout</button>\n    </div>\n</div>");

  ProfileView.prototype.className = "view-user-index";

  ProfileView.prototype.render = function() {
    var user;
    return (user = new User).fetch().then((function(_this) {
      return function() {
        var html;
        html = _this.tmpl(user.toJSON());
        return _this.$el.html(html);
      };
    })(this)).fail(function() {
      return App.router.navigate("login", {
        trigger: true
      });
    });
  };

  return ProfileView;

})(Backbone.View);

module.exports = ProfileView;
