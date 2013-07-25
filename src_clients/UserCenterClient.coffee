_ = require "underscore"
request = require "request"
urlLib = require "url"

urlAddQuery = (url,query)->
	urlObj = urlLib.parse url
	urlObj.query ?= {}
	for k,v of query
		urlObj.query[k]=v
	urlLib.format urlObj
class UserCenterClient
	constructor:(@config)->
	host:"localhost:3000"
	getUser:(ticket,callback)->
		baseUrl = "http://#{host}/sso"
		console.log("getUser,ticket:",ticket)
		urls = 
			base:baseUrl
			check:"#{baseUrl}/check/"
		if ticket
			url = urlAddQuery urls.check,ticket:ticket.toString()
			console.log "req",url
			request url,(err,_res,data)->
				if not err
					data = JSON.parse data
					callback err,data
		else 
			url = urlAddQuery urls.base,
				callback:urls.base+"/test/"
			callback "redirect to url",url
exports.client = UserCenterClient
exports.expressRouter = (config)->
	ucc = new UserCenterClient(config)
	(req,res,next)->
		# curUrl = req.protocol + "://" + req.get('host') + req.url
		ucc.host ?= config.host
		ucc.getUser req.query.ticket,(err,ret)->
			if not err 
				console.log req.get("host")
				req.session.user = req.user = ret
				next()
			else 
				req.session = null
				res.redirect ret  