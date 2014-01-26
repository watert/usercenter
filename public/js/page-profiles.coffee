require ["backbone.marionette"],(M)->	
	class UserModel extends Backbone.Model
		url:"/user/api/my"
	class Users extends Backbone.Collection
		url:"/user/api/"
	class GreetingView extends M.ItemView
		template:"#tmpl-greeting"
	class UserView extends M.ItemView
		template:"#user-item"
		initialize:(options)->
			if options.template 
				@template = options.template
	class UsersListView extends M.CollectionView
		itemView:UserView.extend className:"col-sm-6"

	app = window.app = new M.Application
	app.user = new UserModel()
	app.users = new Users()
	app.addRegions
		navUser:".nav-user-info"
		userList:"ul.users"
		greeting:"#greeting"
	app.addInitializer (options)->
		userView = new UserView(model:app.user)
		greetingView = new GreetingView model:app.user
		usersView = new UsersListView(collection:app.users)
		app.user.fetch success:->
			app.navUser.show(userView)
			app.greeting.show(greetingView)
			if app.user.get("name") is "watert"
				app.userList.show(usersView)
				app.users.fetch()

	app.start(key:"val")


	# $user = $(".user-info").userView(user)
# require ["backbone","jquery","ldata"],()-> $ ->
# 	class UserModel extends Backbone.Model
# 		url:"/user/api/my"
# 	class Users extends Backbone.Collection
# 		url:"/user/api/"
# 	user = new UserModel()
# 	$.fn.userView = (model)->
# 		$user = $(this).ldata(model.toJSON())
# 			.attr("data-user",model.get("name"))
	
# 	user.fetch success:->
# 		$(".article").userView(user)
# 		$user = $(".user-info").userView(user)
# 		if user.get("name") is "watert" #admin
# 			users = new Users()
# 			users.fetch success:->
# 				$parent = $user.parent()
# 				users.each (model)->
# 					$userRow = $user.clone().appendTo($parent)
# 					$userRow.userView(model)
# 		console.log "hey",user.toJSON()