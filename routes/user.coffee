# User route, base url is "api/user"
_ = require("underscore")
crypto = require('crypto')
md5sum = (str)-> crypto.createHash('md5').update(str).digest('hex')
cryptoPassword = (psw)-> md5sum("saltString"+md5sum(psw))

class User
	login: (data)->
		

express = require('express')
router = express.Router()

fakeData = 
	name:"_testusername"
	password:cryptoPassword("_testpass")
	email:"_test@email.com"

router.get '/profile', (req, res)->
	data = _.omit(fakeData,"password")
	res.json(data)
  # res.status(404).json('do sth');

module.exports = router
