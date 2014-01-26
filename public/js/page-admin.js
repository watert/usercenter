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

    var AdminController, ModalView, QuickView, Users, modal, _ref, _ref1, _ref2;
    ModalView = (function(_super) {
      __extends(ModalView, _super);

      function ModalView() {
        _ref = ModalView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ModalView.prototype.className = "modal fade";

      ModalView.prototype.template = _.template("<div class=\"modal-dialog\">\n  <div class=\"modal-content\">\n    <div class=\"modal-header\">\n      <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n      <h4 class=\"modal-title\">Modal title</h4>\n    </div>\n    <div class=\"modal-body\">\n    </div>\n    <div class=\"modal-footer\">\n      	        <button type=\"button\" class=\"btn btn-destroy\" data-dismiss=\"modal\">destroy</button>\n      	        <button type=\"button\" class=\"btn btn-save\" data-dismiss=\"modal\">Save</button>\n      	        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n    </div>\n  </div><!-- /.modal-content -->\n</div><!-- /.modal-dialog -->");

      ModalView.prototype.modal = function(a, b, c) {
        return this.$el.modal(a, b, c);
      };

      ModalView.prototype.onRender = function() {
        var data, invokeTmpl, _ref1;
        invokeTmpl = function(tmpl, model) {
          if (typeof tmpl === "string") {
            return tmpl = _.template(tmpl);
          }
        };
        data = (_ref1 = this.options) != null ? _ref1.model : void 0;
        if (this.options.templateBody) {
          this.$(".modal-body").html(Marionette.Renderer.render(this.options.templateBody, data));
        }
        if (this.options.templateFooter) {
          this.$(".modal-footer").prepend(Marionette.Renderer.render(this.options.templateFooter, data));
        }
        if (this.options.title) {
          this.$(".modal-title").html(this.options.title);
        }
        return console.log("onrender");
      };

      ModalView.prototype.initialize = function() {
        this.$el.appendTo($("body"));
        console.log("initialize");
        return this.render();
      };

      return ModalView;

    })(BM.ItemView);
    modal = new ModalView({
      templateBody: _.template(" \n<label for=\"\">label</label>\n<input type=\"text\" name=\"fieldName\" class=\"form-control\">"),
      templateFooter: _.template("<button class=\"btn btn-primary btn-save\">Save</button>")
    });
    modal.modal("show");
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
    AdminController = (function(_super) {
      __extends(AdminController, _super);

      function AdminController() {
        _ref2 = AdminController.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      AdminController.prototype.initialize = function(options) {
        var tableView, users;
        users = new Users();
        tableView = new QuickView({
          template: "#tmpl-users",
          itemView: BM.ItemView.extend({
            template: "#tmpl-user-tr",
            tagName: "tr"
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
    return $(function() {
      var ctrl;
      return ctrl = new AdminController();
    });
  });

}).call(this);
