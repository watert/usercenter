### 
	# Init with app
	userRoute = require("./routes/user.coffee") 
	userRoute.init(app,"/user/")
	app.get "/",(req,res)->
		user = userRoute.userByReq(req) #get user


	Getting User:
###
mongoose = require "mongoose"
_ = require "underscore"
crypto = require "crypto"
# GET users listing.
User = require("../models/user").model
User.parse = (user)->
	delete user.password
	hash = crypto.createHash('md5').update(user.email.toLowerCase().trim()).digest('hex')
	user = user.toObject() if user.toObject
	user.gravatar = "http://www.gravatar.com/avatar/#{hash}"
	user
exports.init
query = (where,func)->
	User.find().select("-password").exec (err,ret)-> 
		res.jsonp ret
userByReq = (req,callback)-> 
	callback ?= ()-> false
	user = req?.session?.user
	User.findById(user?._id).exec (err,data)-> 
		callback(err,data)
	return user
exports.userByReq = userByReq
exports.logout = (req)-> 
	req.session.user = false
exports.init = (app,base="/user")->
	app.get "#{base}/admin", (req,res)-> 
		userByReq req,(err,user)->
			if not user 
				res.redirect("#{base}/")
			else 
				res.render("page-admin")
	app.get("#{base}/profile", exports.profile)
	app.get("#{base}/regist", exports.regist)
	app.post("#{base}/regist", exports.registPost)

	app.get("#{base}", exports.index)
	app.get("#{base}/index", exports.index)
	app.post("#{base}/login", exports.loginPost)
	app.post "#{base}/login", (req,res)->
		res.redirect("#{base}/profile")
	app.get "#{base}/logout", (req,res)->
		exports.logout(req)
		res.redirect "#{base}/"
	# API part
	app.all("#{base}/api/", exports.api)
	app.all("#{base}/api/:id", exports.api)
exports.index = (req,res)->
	res.render("index")
exports.api = (req,res)->
	method = req.route.method
	data = req.data or req.body
	id = req?.params?.id or null
	if id is "my"
		res.json req.session.user
		return 
	if data and data.password 
		data.password = User.parsePassword data.password
	switch method
		when "get" 
			User.find().select("-password").sort("_id":1)
				.exec (err,ret)-> 
					res.jsonp (User.parse(row) for row in ret)
		when "put"
			if not id then res.json "No ID",400
			else User.findById id,(err,model)->	
				model?.set(data).save (err)->
					if not err then res.json User.parse(model)
		when "delete"
			if not id then res.json "No ID",400
			else User.findByIdAndRemove id,(err,ret)->
				if not err 
					res.json "success"
					exports.logout()
				else res.json err,400

exports.loginPost = (req,res,next)->
	data = req.body
	data.password = User.parsePassword data.password
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
	else res.redirect "#{base}/"
exports.index = (req,res)->
	res.render "index"
exports.registPost = (req,res)->
	data = req.body
	data.password = User.parsePassword data.password
	u = new User data
	u.save (err,ret)->
		if not err 
			res.redirect("#{base}/profile")
		else res.jsonp err
exports.regist = (req,res)->
	res.render "regist"
exports.list = (req, res)->
	User.find().select("-password").exec (err,ret)-> 
		res.jsonp ret
	# res.send "respond with a resource"