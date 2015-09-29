require 'coffee-script/register'

{BaseDoc, DBStore} = require("./db.coffee")
crypto = require('crypto')
_ = require('underscore')
q = require("q")
q.longStackSupport = yes
fs = require("fs")
path = require("path")
# Dispatcher = require("../../public/scripts/libs/action-dispatcher")
_hasKeys = (obj, keys)->
    for k in keys
        if not obj[k] then return no
    return yes
class UserDoc extends BaseDoc
    @store: "userdocs"
    constructor:(data)->
        super(data)
    checkData:(data)->
        data ?= @_data
        if user = data.user
            data.user_id = user.id or user._id
            return _.omit(data, "user")
        if not data.user_id
            return error: {code: 400, message:"UserDoc #{@store} must have user data or user_id"}
        return data
    save:(_data=null)->
        data = @checkData(_data)
        @set(data)
        @omit("user")
        if err = data?.error
            return q.reject(error:err)
        super(data)
class UserFile extends UserDoc
    @store: "userfiles"
    remove:()->
        q.nfcall(fs.unlink, @get("path")).then =>
            super()
    save:(data=null)->
        data ?= @_data
        source = data.file
        source = source?.path or source
        if data?.path and not source
            @set(data)
            return super()
        fname = path.basename(source)
        extname = path.extname(fname).slice(1)
        getUrl = (id)-> "uploads/#{id}.#{extname}"
        getTarget = (id)-> "#{__dirname}/../../public/#{getUrl(id)}"
        q.nfcall(fs.stat, source)
        .then (info)=>
            fdoc = {fname:fname, extname:extname}
            stat = _.pick(info, "mtime", "size", "ctime")
            fdoc = _.extend(fdoc, data, stat)
            @set(fdoc)
            @omit("file")
            super()
        .then (doc)=>
            id = doc.id
            target = getTarget(id)
            url = getUrl(id)
            @set(path:target, url:url)
            # console.log "@set", doc._data
            super()
        .then (doc)->
            q.nfcall(fs.rename, source, getTarget(doc.id)).then ->
                return doc

class User extends BaseDoc
    @UserDoc: UserDoc
    @UserFile: UserFile
    md5 = (_str)->
        crypto.createHash('md5').update(_str).digest('hex')
    @hash: (str)-> md5(md5(str))
    @store: "user"
    @register:(data)->
        if not _hasKeys(data, ["email", "name", "password"])
            return Promise.reject({error:{code:406, message: "needed more info to register"},data:data})
        return @find({$or: [{email:data.email}, {name:data.name}]}).then (ret)=>
            if ret.length
                return q.reject({error:{code:409, message:"name or email already exists"}})
            else
                data = _.extend({}, data, password: @hash(data.password))
                user = new this(data)
                user.save().then -> user
    @login:(data)->
        if not data.password
            Promise.reject({error:{code:406, message: "no password"},data:data})
        data.password = @hash(data.password)
        @findOne(data).then (user)-> user


module.exports = User
