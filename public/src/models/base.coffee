Backbone = require('backbone')
class BaseModel extends Backbone.Model
    parse:(ret={})->
        @links = ret.links
        return ret.data or ret
    @post:(url, data)->
        console.log "posturl",@prototype.rootUrl+url
        $.post(@prototype.rootUrl+url, data)
    @get:(url, data)-> $.get(@prototype.rootUrl+url, data)
module.exports = BaseModel
