urlLib = require "url"
mongoose = require "mongoose"

urlAddQuery = (url,query)->
	urlObj = urlLib.parse url
	urlObj.query ?= {}
	for k,v of query
		urlObj.query[k]=v.toString()
	urlLib.format urlObj

timeout = 5*60*1000 #5分钟
Ticket = mongoose.model 'Ticket', 
	referer:"String"
	createTime:{type:"Date",default:Date.now},
	user:{}
Ticket.parseUrl = (url,ticket)->
	urlAddQuery url,ticket:ticket
Ticket.create = (req,callback)->
	user = req.session?.user
	if not user 
		callback "No logined",null
	else 
		t = new Ticket 
			referer:req.headers.referer or "_local"
			user:user
		t.save (err,ret)->
			callback null,ret._id.toString()

Ticket.check = (ticket,callback)->
	if typeof ticket isnt "object" then ticket = mongoose.mongo.ObjectID ticket
	Ticket.findById ticket,(err,ret)->
		if err  
			callback err
		else 
			offset = Date.now() - ret.createTime
			isValid = offset<timeout
			if not isValid
				err = "not valid"
			callback err,ret.user


exports.model = Ticket