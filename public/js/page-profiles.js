(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  require(["backbone.marionette"], function(M) {
    var GreetingView, UserModel, UserView, Users, UsersListView, app, _ref, _ref1, _ref2, _ref3, _ref4;
    UserModel = (function(_super) {
      __extends(UserModel, _super);

      function UserModel() {
        _ref = UserModel.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      UserModel.prototype.url = "/user/api/my";

      return UserModel;

    })(Backbone.Model);
    Users = (function(_super) {
      __extends(Users, _super);

      function Users() {
        _ref1 = Users.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Users.prototype.url = "/user/api/";

      return Users;

    })(Backbone.Collection);
    GreetingView = (function(_super) {
      __extends(GreetingView, _super);

      function GreetingView() {
        _ref2 = GreetingView.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      GreetingView.prototype.template = "#tmpl-greeting";

      return GreetingView;

    })(M.ItemView);
    UserView = (function(_super) {
      __extends(UserView, _super);

      function UserView() {
        _ref3 = UserView.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      UserView.prototype.template = "#user-item";

      UserView.prototype.initialize = function(options) {
        if (options.template) {
          return this.template = options.template;
        }
      };

      return UserView;

    })(M.ItemView);
    UsersListView = (function(_super) {
      __extends(UsersListView, _super);

      function UsersListView() {
        _ref4 = UsersListView.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      UsersListView.prototype.itemView = UserView.extend({
        className: "col-sm-6"
      });

      return UsersListView;

    })(M.CollectionView);
    app = window.app = new M.Application;
    app.user = new UserModel();
    app.users = new Users();
    app.addRegions({
      navUser: ".nav-user-info",
      userList: "ul.users",
      greeting: "#greeting"
    });
    app.addInitializer(function(options) {
      var greetingView, userView, usersView;
      userView = new UserView({
        model: app.user
      });
      greetingView = new GreetingView({
        model: app.user
      });
      usersView = new UsersListView({
        collection: app.users
      });
      return app.user.fetch({
        success: function() {
          app.navUser.show(userView);
          app.greeting.show(greetingView);
          if (app.user.get("name") === "watert") {
            app.userList.show(usersView);
            return app.users.fetch();
          }
        }
      });
    });
    return app.start({
      key: "val"
    });
  });

}).call(this);
