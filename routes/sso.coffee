mongoose = require "mongoose"
_ = require "underscore"
urlLib = require "url"

# timeout = 5*60*1000 #5分钟
urlAddQuery = (url,query)->
	urlObj = urlLib.parse url
	urlObj.query = _.extend (urlObj.query?={}),query
	urlLib.format urlObj
# console.log urlAddQuery "http://localhost",key:"val"

Ticket = require("../models/ticket").model
Ticket.parseUrl = (url,ticket)->
	urlAddQuery url,ticket:ticket.toString()
Ticket.getUser = (ticket,callback)->
	baseUrl = "http://localhost:3000/sso"
	urls = 
		base:baseUrl
		check:"#{baseUrl}/check/"
	if ticket
		url = Ticket.parseUrl urls.check,ticket
		request url,(err,_res,data)->
			if not err
				data = JSON.parse data
				callback err,data
	else 
		url = urlAddQuery urls.base,
			callback:urls.base+"test/"
		callback "redirect to url",url
getUserRoute = (req,res,next)->
	Ticket.getUser req.query.ticket,(err,ret)->
		if not err 
			req.session.user = req.user = ret
			next()
		else 
			res.redirect ret 
User = require("../models/user").model



request = require "request"
exports.init = (app,path)->
	app.all "#{path}/*",(req,res,next)->
		req.user = req.session?.user
		next()
	app.get "#{path}/test",getUserRoute
	app.get "#{path}/test",(req,res)->
		res.json "hello,#{req.user.name}"
	app.get path,(req,res)->
		callback = req.query?.callback
		Ticket.create req,(err,ticket)->
			if not err and callback
				url = Ticket.parseUrl callback,ticket
				res.redirect url
			else
				res.json err
		# res.json req.session
	app.post "#{path}/login",(req,res)->
		User.login req.body,(err,user)->
			req.session.user = user
			res.json user
	app.get "#{path}/login",(req,res)->

		res.render "login"
	app.get "#{path}/check",(req,res)->
		ticket = req.query.ticket
		if ticket then Ticket.check ticket,(err,user)->
			res.json user
		# if Ticket.check

