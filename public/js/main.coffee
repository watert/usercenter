require ["app","routers/user"],(app,UserRouter)->
	window.App = app
	class MainRouter extends Backbone.Router
		routes:
			"":()-> @navigate "user/sign",replace:yes,trigger:yes

	app.router = new MainRouter
	app.userRouter = new UserRouter 
		el:$("#main")[0]

	app.user = app.userRouter.user
	app.user.on "login",()->
		console.debug "app.user logined"

	Backbone.history.start(pushState: true)