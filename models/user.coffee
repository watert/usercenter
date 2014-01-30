mongoose = require "mongoose"
crypto = require "crypto"

User = mongoose.model 'User', 
	name: {type:"String",lowercase:true}
	email: {type:"String",index: {unique: true, dropDups: true}}
	password: {type:"String",unique:false}
	role: {type:"String",default:"guest"}
User.parsePassword = (password)->
	crypto.createHash('sha512').update(password).digest('base64')
User.login = (data,callback)->
	data.password = User.parsePassword data.password
	User.findOne(data)
		.select("-password")
		.exec (err,ret)->
			callback err,ret
exports.model = User