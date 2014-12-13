define ["jquery","backbone"],($,Backbone)->
	urls = 
		profile: "api/user/profile/"
		login: "api/user/login/"
		signOut: "api/user/signOut/"
		register: "api/user/register/"
	
	testData = 
		name:"_testusername"
		password:"_testpass"
		email:"_test@email.com"
		profile:"Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula."

	promiseRequest = (originalDfd)->
		#fake
		return $.when(new User(testData))

		#online
		originalDfd.then (res)=>
			return $.when(new User(res.data))

	class User extends Backbone.Model
		initialize:(options)->
			super(options)
			@on "login",(user)->
				User.currentUser = user

		url:()->
			id = @get("id")
			if id then "api/user/#{id}"
			else urls.profile

		@getCurrentUser:()->
			return User.currentUser or null
		# 全局信息需要promise返回user model
		login:(options)->
			$dfd = $.post(urls.login, options.data)
			promiseRequest($dfd).done (_user)=>
				this.set(_user.toJSON())
				User.currentUser = this
				console.debug "try trigger User",this
				@isLogin = yes
				@trigger("login",this)
		signUp:(options)->
			$dfd = $.post(urls.register, options.data)
			promiseRequest($dfd).done (user)=>
				@set(user.toJSON())
				@trigger("signUp",this)
		signOut:(options)->
			promiseRequest($.get(urls.signOut))
			User.currentUser.stopListening()
			@isLogin = no
			User.currentUser = null


	_.extend User,Backbone.Events
	return User