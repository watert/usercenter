# mongoose = require "mongoose"
# _ = require "underscore"

# Models
Ticket = require("../models/ticket").model
User = require("../models/user").model

#
exports.init = (app,path)->
	app.get path,(req,res)->
		callback = req.query?.callback
		Ticket.create req,(err,ticket)->
			if not err and callback
				url = Ticket.parseUrl callback,ticket
				res.redirect url
			else
				curUrl = req.protocol + "://" + req.get('host') + req.url
				url = "#{path}/login?callback=#{curUrl}"
				res.redirect url
	app.post "#{path}/login",(req,res)->
		User.login req.body,(err,user)->
			req.session.user = user
			callback = req.query?.callback
			if callback then res.redirect callback
			else res.json user
	app.get "#{path}/login",(req,res)->
		res.render "login"
	app.get "#{path}/check",(req,res)->
		ticket = req.query.ticket
		if ticket then Ticket.check ticket,(err,user)->
			console.log err,user
			if not err then res.json user
			else res.json err
		# if Ticket.check

