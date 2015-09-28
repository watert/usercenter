_ = require("underscore")
fs = require("fs")
path = require("path")
DBStore = require("nedb")
path = require("path")
config =
    appPath: (_path="")->
        return path.join(__dirname,"../",_path)
q = require("q")

wrapMethods = (obj,methods)->
    generateNewMethod = (oldMethod)-> (args...)->
        new Promise (res,rej)->
            callback = (err,ret...)->
                if err then rej(err,ret...)
                else res(ret...)
            if args.length then oldMethod(args...,callback)
            else oldMethod(callback)
    for m in methods
        do (oldMethod = obj[m].bind(obj) )->
            obj[m] = generateNewMethod(oldMethod)
    return obj

DBStore.dbStatus = ()->
    dbPath = config.appPath("db/")
    q.nfcall(fs.readdir, dbPath).then (data)->
        dbs =_.filter(data, (path)-> path?.indexOf(".db") isnt -1)
        dfds = _.map dbs, (fname)->
            fpath = path.join(dbPath,fname)
            q.nfcall(fs.stat, fpath).then (ret)->
                data = _.pick(ret,"mtime,ctime,size".split(","))
                data.path = fpath
                data._id = data.name = path.parse(fname).name
                return data
        q.all(dfds)
DBStore.storePath = (name)->
    config.appPath("db/#{name}.db")
DBStore.storeConfig = (name)->
    conf =
        filename: DBStore.storePath(name)
        # autoload:yes
    return conf

_stores = {}
DBStore.getStore = (name)->
    if cache = _stores[name] then return q.when(cache)
    dbconfig = DBStore.storeConfig(name)
    store = new DBStore(dbconfig)
    new Promise (res,rej)->
        store.loadDatabase (err)->
            wrapMethods(store, ["findOne","insert","update","remove","count"])
            if not err then res(store) else rej(err)
        _stores[name] = store

class BaseDoc
    @store: "test"
    constructor: (data,val)->
        if not data then data = {}
        if val then data = {data:val}
        @_data = _.extend({},data)
        @changed = yes
        @id = data._id
        _.extend(@, _.pick(@constructor,["store","getStore"]))
    set:(object)->
        _.extend(@_data, object)
        @changed = yes
        return @
    get:(key=null)->
        if not key then return @_data
        else return @_data[key]
    omit:(args...)->
        @_data = _.omit(@_data, args...)
    save:(object)->
        if object then @set(object)
        data = @_data
        where = _.pick(data, "_id")
        # @beforeSave?(data)
        @getStore().then (store)=>
            if data._id
                return store.update(where, data, {}).then =>
                    @constructor.findOne(_id:data._id)
            else store.insert(data).then (data)=>
                @_data = data
                @id = data._id
                return new @constructor(data)
        .then (data)=>
            @changed = no
            return data
    remove: ()->
        @getStore().then (store)=>
            where = _.pick(@_data, "_id")
            store.remove(where, {})
        .then (num)=>
            id = @_data._id
            delete @_data._id
            @isDeleted = yes
            return num
    @count:(data)->
        @getStore().then (store)->
            store.count(data).then (num)-> {count:num, id:-1}
    @findByID:(id)->
        DocClass = this
        @find({_id:id}).then (data)->
            if not data.length
                return q.reject(message:"not found by id #{id}")
            new DocClass(data[0])
    @remove: (where)->
        @getStore().then (store)->
            store.remove(where, {multi:yes})
    @removeByID:(id)->
        @getStore().then (store)->
            store.remove({_id:id}, {})
    @getStore:()->
        q.when(DBStore.getStore(@store))
    @findOne:(args...)->
        DocClass = this
        @getStore().then (store)->
            console.log "db findOne args",args...
            store.findOne(args...).then (data)->
                if not data then q.reject("document not found")
                new DocClass(data)
    @find:(where={}, args...)->
        @getStore().then (store)->
            act = store.find(where, args...)
            return q.ninvoke(act, "exec")

module.exports = {BaseDoc, DBStore}
