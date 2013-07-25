mongoose = require "mongoose"

timeout = 5*60*1000 #5分钟
Ticket = mongoose.model 'Ticket', 
	referer:"String"
	createTime:{type:"Date",default:Date.now},
	user:{}
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
	Ticket.findById ticket,(err,ret)->
		offset = Date.now() - ret.createTime
		isValid =  offset<timeout
		callback isValid,ret.user
		# console.log offset,isTimeout

exports.model = Ticket