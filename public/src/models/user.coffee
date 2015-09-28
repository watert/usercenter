Model = require("./base.js")
class User extends Model
    idAttribute:"_id"
    url:"api/"
    rootUrl:"api/"
    @profile:(data)->
        (user = new this(data)).fetch().then -> user
    @register:(data)->
        @post("register", data).then (res)->
            new User(res.data)
    @login:(data)->
        @post("login", data).then (res)->
            new User(res.data)

module.exports = User
