(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("views", ["backbone.marionette"], function(BM) {
    var views;
    views = {};
    return views;
  });

  require(["backbone.marionette"], function(BM) {
    /* USAGE:
    		modalView = new ModalView 
    			templateBody:_.template """ 
    				<label for="">label</label>
    				<input type="text" name="fieldName">
    			"""
    			templateFooter:_.template """
    				<button class="btn btn-primary btn-save">Save</button>
    			"""
    		modalView.modal("show")
    */

    var AdminController, ModalView, QuickView, UserEditor, UserTableView, Users, app, _ref, _ref1, _ref2, _ref3;
    ModalView = (function(_super) {
      __extends(ModalView, _super);

      ModalView.prototype.className = "modal fade";

      ModalView.prototype.regions = {
        title: ".modal-title",
        body: ".modal-body",
        footer: ".modal-footer"
      };

      ModalView.prototype.template = _.template("<div class=\"modal-dialog\">\n  <div class=\"modal-content\">\n    <div class=\"modal-header\">\n      <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n      <h4 class=\"modal-title\">Modal title</h4>\n    </div>\n    <div class=\"modal-body\">\n    </div>\n    <div class=\"modal-footer\">\n      	        <button type=\"button\" class=\"btn btn-primary btn-save\" data-dismiss=\"modal\">Save</button>\n      	        <button type=\"button\" class=\"btn pull-left btn-danger btn-destroy\" data-dismiss=\"modal\">\n					<i class=\"glyphicon glyphicon-trash\"></i> Destroy\n      	        </button>\n      	        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n    </div>\n  </div><!-- /.modal-content -->\n</div><!-- /.modal-dialog -->");

      ModalView.prototype.modal = function(a, b, c) {
        this.$el.modal(a, b, c);
        return this;
      };

      ModalView.prototype.show = function(view) {
        var html;
        this.body.show(view);
        if (view.title) {
          this.$(".modal-title").html(view.title);
        }
        if (view.templateFooter) {
          html = Marionette.Renderer.render(view.templateFooter, data);
          this.$(".modal-footer").prepend(html);
        }
        return this;
      };

      ModalView.prototype.renderModal = function() {
        var data, render, _ref;
        data = (_ref = this.options) != null ? _ref.model : void 0;
        render = Marionette.Renderer.render;
        if (this.templateFooter) {
          this.$(".modal-footer").prepend(render(this.templateFooter, data));
        }
        if (this.options.title) {
          return this.$(".modal-title").html(this.options.title);
        }
      };

      function ModalView(options) {
        var _this = this;
        ModalView.__super__.constructor.call(this, options);
        this.on("render", function() {
          return _this.renderModal();
        });
        this.$el.appendTo($("body"));
        this.render();
      }

      return ModalView;

    })(BM.Layout);
    UserEditor = (function(_super) {
      __extends(UserEditor, _super);

      function UserEditor() {
        _ref = UserEditor.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      UserEditor.prototype.template = _.template(" \n<label for=\"\">JSON Data</label>\n<textarea class=\"form-control\" name=\"json\" rows=\"10\"></textarea>");

      UserEditor.prototype.onRender = function() {
        var json;
        json = JSON.stringify(this.model.toJSON(), null, 4);
        if (this.model) {
          return this.$("[name=json]").val(json);
        }
      };

      return UserEditor;

    })(BM.ItemView);
    QuickView = (function(_super) {
      __extends(QuickView, _super);

      function QuickView(options, b, c, d) {
        var attrs;
        attrs = ["itemView", "itemViewContainer", "template", "tagName", "className"];
        _.extend(this, _.pick(options, attrs));
        QuickView.__super__.constructor.call(this, options, b, c, d);
      }

      return QuickView;

    })(BM.CompositeView);
    Users = (function(_super) {
      __extends(Users, _super);

      function Users() {
        _ref1 = Users.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Users.prototype.url = "/user/api/";

      return Users;

    })(Backbone.Collection);
    UserTableView = (function(_super) {
      __extends(UserTableView, _super);

      function UserTableView() {
        _ref2 = UserTableView.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      UserTableView.prototype.template = "#tmpl-users";

      UserTableView.prototype.itemViewContainer = "#users-tbody";

      return UserTableView;

    })(BM.CompositeView);
    AdminController = (function(_super) {
      __extends(AdminController, _super);

      function AdminController() {
        _ref3 = AdminController.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      AdminController.prototype.getModalView = function() {
        if (!this.modalView) {
          this.modalView = new ModalView;
        }
        return this.modalView;
      };

      AdminController.prototype.editUser = function(user) {
        var editor, modal;
        modal = this.getModalView();
        editor = (new UserEditor({
          model: user
        })).render();
        return modal.show(editor).modal('show');
      };

      AdminController.prototype.initialize = function(options) {
        var ctrl, tableView, users;
        ctrl = this;
        users = new Users();
        tableView = new QuickView({
          template: "#tmpl-users",
          itemView: BM.ItemView.extend({
            template: "#tmpl-user-tr",
            tagName: "tr",
            events: {
              "click .btn-edit": function(e) {
                e.preventDefault();
                console.log("edit", this.model);
                return ctrl.editUser(this.model);
              }
            }
          }),
          itemViewContainer: "#users-tbody",
          el: "#users",
          collection: users
        });
        tableView.render();
        return users.fetch({
          success: function() {
            console.log(users.toJSON());
            return tableView.render();
          }
        });
      };

      return AdminController;

    })(BM.Controller);
    window.app = app = new BM.Application();
    return $(function() {
      return app.ctrl = new AdminController();
    });
  });

}).call(this);
