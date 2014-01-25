(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  require(["backbone.marionette"], function(M) {
    var UserModel, UserView, Users, UsersListView, app, _ref, _ref1, _ref2, _ref3;
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
    UserView = (function(_super) {
      __extends(UserView, _super);

      function UserView() {
        _ref2 = UserView.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      UserView.prototype.template = "#user-item";

      return UserView;

    })(M.ItemView);
    UsersListView = (function(_super) {
      __extends(UsersListView, _super);

      function UsersListView() {
        _ref3 = UsersListView.__super__.constructor.apply(this, arguments);
        return _ref3;
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
      navUserRegion: ".nav-user-info",
      usersRegion: "ul.users"
    });
    app.addInitializer(function(options) {
      var userView, usersView;
      userView = new UserView({
        model: app.user
      });
      usersView = new UsersListView({
        collection: app.users
      });
      return app.user.fetch({
        success: function() {
          app.navUserRegion.show(userView);
          console.log(app.user.toJSON(), app.user.get("name") === "watert");
          if (app.user.get("name") === "watert") {
            app.usersRegion.show(usersView);
            return app.users.fetch();
          }
        }
      });
    });
    app.start({
      key: "val"
    });
    return console.log("app start");
  });

}).call(this);
