mongoose = require "mongoose"
_ = require "underscore"
crypto = require "crypto"
# GET users listing.
User = require("../models/user").model
User.parse = (user)->
	hash = crypto.createHash('md5').update(user.email.toLowerCase().trim()).digest('hex')
	user ?= user?.toJSON()
	user.gravatar = "http://www.gravatar.com/avatar/#{hash}"
	user

query = (where,func)->
	User.find().select("-password").exec (err,ret)-> 
		res.jsonp ret
exports.api = (req,res)->
	method = req.route.method
	data = req.data
	id = req?.params?.id or null
	if id is "my"
		res.json req.session.user
		return 
	if data and data.password 
		data.password = User.parsePassword data.password
	switch method
		when "get" 
			User.find().select("-password").exec (err,ret)-> 
				console.log "parse",User.parse(ret[0])
				res.jsonp (User.parse(row) for row in ret)
				# res.jsonp ret
		when "delete"
			if not id then res.json "No ID",400
			else User.findByIdAndRemove id,(err,ret)->
				console.log "delete",err,ret
				if not err then res.json "success"
				else res.json err,400

exports.loginPost = (req,res,next)->
	data = req.body
	data.password = User.parsePassword data.password
	User.findOne(data).select("-password").exec (err,ret)->
		req.session.user = ret
		next()
exports.profile = (req,res)->
	user = req.session.user
	user = User.parse user

	if user
		res.render "profile",user:user
	else res.redirect "/user/login"
exports.login = (req,res)->
	res.render "login"
exports.registPost = (req,res)->
	data = req.body
	data.password = User.parsePassword data.password
	u = new User data
	u.save (err,ret)->
		if not err then res.jsonp ret:ret,msg:"success"
		else res.jsonp err
exports.regist = (req,res)->
	res.render "regist"
exports.list = (req, res)->
	User.find().select("-password").exec (err,ret)-> 
		res.jsonp ret
	# res.send "respond with a resource"