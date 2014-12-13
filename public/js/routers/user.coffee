define ["backbone","models/user","bootstrap"],(Backbone,User)->

	class UserRouter extends Backbone.Router
		initialize:(o)->
			@region = new RegionView(el:o.el)

			@user = new User
			@user.on "login",()=>
				@navigate "user/profile",trigger:yes
			console.debug @region
		routes:
			"user/":()->
				@navigate "user/sign",replace:yes,trigger:yes
			"user/sign":"signPage"
			"user/profile":()->
				if @user.isLogin
					profile = new ProfileView(model:@user)
					@region.load(profile)
				else 
					@navigate "user/sign",replace:yes,trigger:yes


		signPage:()->
			console.debug "index"
			signPage = new SignView
				model:@user
			@region.load(signPage)
			console.debug "region load signPage"


	formData = ($form)->
		return _.object _.map $form.find("input, select"),(el)->
			$input = $(el)
			[$input.attr("name"),$input.val()]

	class BaseView extends Backbone.View
		render:()->
			data = @model?.toJSON() or {}
			@$el.html(@tmpl(data))
			@trigger("render")
			@onRender?()
	class RegionView extends BaseView
		tagName:"div"
		load:(view)->
			@currentView?.remove()

			@$el.append(view.$el)
			@currentView = view
			view.render()



	class ProfileView extends BaseView
		tmpl:_.template """
			<div class="container">
				<div class="row">
					<div class="col-sm-6 col-sm-offset-3">
						<div class="text-center"> 
							<h1 class="avatar">
								<i class="fa fa-user"></i>
							</h1>
							<p><%=name%><br>
								<small class="text-muted"> <%=email%></small>
							</p>
							<br>
							<p><%=profile%></p>
						</div>
					</div>
				</div>
			</div>			
		"""

	class SignView extends BaseView 
		tagName:"div"
		events:
			"submit #login":(e)->
				e.preventDefault()
				$form = $(e.target)
				data = formData($form)
				@model.login(data)
			"submit #signup":(e)->
				e.preventDefault()
				$form = $(e.target)
				data = formData($form)
				@model.signUp(data)

				console.debug "signup", data, e.target
		initialize:(options)->
			super(options)
			console.debug @model
			@model ?= new User
		onRender:()->
			@$(".nav-tabs a").click ->
				$(@).tab("show")
			.first().click()
		tmpl: _.template """
			<div class="container">
				<div class="row">
					<div class="col-sm-6 col-sm-offset-3">

						<div class="panel panel-auth">
							<div class="panel-body">
								<ul class="nav nav-tabs">
									<li class=""><a href="#login" data-toggle="tab">Login</a></li>
									<li><a href="#signup" data-toggle="tab">Sign Up</a></li>
								</ul>
								<div class="tab-content">
									<div class="tab-pane" id="login">
										<form action="login" class="form">
											<div class="form-group">
												<label class="input-group">
													<span class="input-group-addon"> 
														<i class="glyphicon glyphicon-envelope"></i>
														Email </span>
													<input type="email" name="email" class="form-control">
												</label>
											</div>
											<div class="form-group">
												<label class="input-group">
													<span class="input-group-addon"> 
														<i class="glyphicon glyphicon-asterisk"></i>
														Password </span>
													<input type="password" name="password" class="form-control">
												</label>
											</div>
											<div class="form-actions">
												<button class="btn btn-login btn-primary">Login</button>
											</div>
										</form>
									</div>
									<div class="tab-pane" id="signup">
										<form action="login" class="form">
											<div class="form-group">
												<label class="input-group">
													<span class="input-group-addon"> 
														<i class="glyphicon glyphicon-user"></i>
														User </span>
													<input type="text" name="user" class="form-control">
												</label>
											</div>
											<div class="form-group">
												<label class="input-group">
													<span class="input-group-addon"> 
														<i class="glyphicon glyphicon-envelope"></i>
														Email </span>
													<input type="email" name="email" class="form-control">
												</label>
											</div>
											<div class="form-group">
												<label class="input-group">
													<span class="input-group-addon"> 
														<i class="glyphicon glyphicon-asterisk"></i>
														Password </span>
													<input type="password" name="password" class="form-control">
												</label>
											</div>

												<button class="btn btn-signup btn-primary">Sign Up</button>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>

					</div>
				</div>
			</div>
		"""
	return UserRouter
