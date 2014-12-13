{assert} = chai
describe "Framework test",->
	it "should assert ok", ()->
		assert.ok(yes,"yes is ok")
describe "User Basic Actions JS API", ()->
	User = null
	testData = {name:"_testusername",password:"_testpass",email:"_test@email.com"}
	# 初始化用户模块
	before (done)=>
		require ["models/user"],(_User)-> 
			User = _User 
			done()

	it "should register", ()->
		(new User).signUp(data:testData).then (user)=>
			assert.equal(user.get("name"), testData.name)
		
	it "should login", ()->
		loginData = _.pick(testData,"email","password")
		(new User).login(data:testData).done (user)=>
			assert.equal(user.get("name"), testData.name)
	it "should get info if is logined", ()->
		(new User).login(data:testData).done (user)=>
			assert.equal(User.getCurrentUser().get("name"),testData.name)
	it "should request info if is logined", ()->
		user = (new User)
		user.fetch().then ->
			assert.equal user.get("name"),testData.name
	it "should signOut",()->
		(new User).signOut()
	it "should login fail auth", (done)->
		loginData = _.pick(testData,"email") # lack of password
		(new User).login(data:testData).fail (data)=>
			assert.equal(data.msg, "auth fail")
			done()
