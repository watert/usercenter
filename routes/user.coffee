mongoose = require "mongoose"
_ = require "underscore"
crypto = require "crypto"
# GET users listing.
User = mongoose.model 'User', 
	name: {type:"String",lowercase:true}
	email: {type:"String",index: {unique: true, dropDups: true}}
	password: "String"
	authority: {}
parsePassword = (password)->
	crypto.createHash('sha512').update(password).digest('base64')

query = (where,func)->
	User.find().select("-password").exec (err,ret)-> 
		res.jsonp ret


exports.api = (req,res)->
	method = req.route.method
	data = req.data
	id = req?.params?.id or null
	if data and data.password 
		data.password = parsePassword data.password
	switch method
		when "get" 
			User.find().select("-password").exec (err,ret)-> 
				res.jsonp ret
		when "delete"
			if not id then res.json "No ID",400
			else User.findByIdAndRemove id,(err,ret)->
				console.log "delete",err,ret
				if not err then res.json "success"
				else res.json err,400

exports.loginPost = (req,res,next)->
	data = req.body
	data.password = parsePassword data.password
	# $or = [{password:data.password},{name:data.name}]
	# User.find({$or:)
	User.findOne(data).select("-password").exec (err,ret)->
		req.session.user = ret
		next()
exports.profile = (req,res)->
	res.render "profile",req.session
exports.login = (req,res)->
	res.render "login"
exports.registPost = (req,res)->
	data = req.body
	data.password = parsePassword data.password
	u = new User data
	u.save (err,ret)->
		console.log err,ret
		if not err then res.jsonp ret:ret,msg:"success"
		else res.jsonp err
exports.regist = (req,res)->
	res.render "regist"
exports.list = (req, res)->
	User.find().select("-password").exec (err,ret)-> 
		res.jsonp ret
	# res.send "respond with a resource"