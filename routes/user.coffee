mongoose = require "mongoose"
_ = require "underscore"
crypto = require "crypto"
# GET users listing.
User = require("../models/user").model
User.parse = (user)->
	hash = crypto.createHash('md5').update(user.email.toLowerCase().trim()).digest('hex')
	user = user.toObject() if user.toObject
	user.gravatar = "http://www.gravatar.com/avatar/#{hash}"
	user
exports.init
query = (where,func)->
	User.find().select("-password").exec (err,ret)-> 
		res.jsonp ret
exports.init = (app,base="/user")->

	app.get("#{base}/profile", exports.profile)
	app.get("#{base}/regist", exports.regist)
	app.post("#{base}/regist", exports.registPost)
	app.get("#{base}/login", exports.login)
	app.post("#{base}/login", exports.loginPost)
	app.post "#{base}/login", (req,res)->
		res.redirect("#{base}/profile")
	# API part
	app.all("#{base}/api/", exports.api)
	app.all("#{base}/api/:id", exports.api)

exports.api = (req,res)->
	method = req.route.method
	data = req.data
	id = req?.params?.id or null
	console.log "api route"
	if id is "my"
		res.json req.session.user
		return 
	if data and data.password 
		data.password = User.parsePassword data.password
	switch method
		when "get" 
			console.log "GET api"
			User.find()
				# .select("-password")
				.exec (err,ret)-> 
					console.log "userfind",err,ret
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
	# console.log data,"login"
	User.findOne(data).select("-password").exec (err,ret)->
		if err then res.json "Login Error"
		else if ret 
			req.session.user = ret
			next()
		else res.json "Not Found"
exports.profile = (req,res)->
	user = req.session.user
	console.log user,"profile"
	user = User.parse user

	if user
		res.render "page-profiles",user:user
		# res.render "profile",user:user
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