var Backbone, BaseModel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = require('backbone');

BaseModel = (function(superClass) {
  extend(BaseModel, superClass);

  function BaseModel() {
    return BaseModel.__super__.constructor.apply(this, arguments);
  }

  BaseModel.prototype.parse = function(ret) {
    if (ret == null) {
      ret = {};
    }
    this.links = ret.links;
    return ret.data || ret;
  };

  BaseModel.post = function(url, data) {
    console.log("posturl", this.prototype.rootUrl + url);
    return $.post(this.prototype.rootUrl + url, data);
  };

  BaseModel.get = function(url, data) {
    return $.get(this.prototype.rootUrl + url, data);
  };

  return BaseModel;

})(Backbone.Model);

module.exports = BaseModel;
