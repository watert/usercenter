mongoose = require "mongoose"
_ = require "underscore"
crypto = require "crypto"

timeout = 10*1000 #

# Ticket = mongoose.model 'Ticket'
Ticket = require("../models/ticket").model

# sha512 = (code)->
# 	crypto.createHash('sha512').update(code).digest('base64')


# Ticket.check "51f09f974f949099a3000001",(isValid,user)->
# 	console.log "isValid",isValid
exports.all = (req,res)->
	# res.json req.headers
	Ticket.create req,(err,ticket)->
		res.json t:ticket,u:req.session.user,url:"/check?ticket=#{ticket}"
	