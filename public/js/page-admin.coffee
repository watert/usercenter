
define "views",["backbone.marionette"],(BM)->
	views = {}
	
	return views

require ["backbone.marionette"],(BM)->
	### USAGE:
		modalView = new ModalView 
			templateBody:_.template """ 
				<label for="">label</label>
				<input type="text" name="fieldName">
			"""
			templateFooter:_.template """
				<button class="btn btn-primary btn-save">Save</button>
			"""
		modalView.modal("show")
	###
	class ModalView extends BM.Layout
		className:"modal fade"
		regions:
			title:".modal-title"
			body:".modal-body"
			footer:".modal-footer"
		template:_.template """
		  <div class="modal-dialog">
		    <div class="modal-content">
		      <div class="modal-header">
		        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
		        <h4 class="modal-title">Modal title</h4>
		      </div>
		      <div class="modal-body">
		      </div>
		    </div><!-- /.modal-content -->
		  </div><!-- /.modal-dialog -->
		"""
		modal:(a,b,c)-> 
			@$el.modal(a,b,c)
			return @
		show:(view)->
			@body.show(view)
			@model ?= view.model
			view.modalView = @
			if view.title then @$(".modal-title").html(view.title)
			if view.templateFooter 
				html = Marionette.Renderer.render(view.templateFooter,data)
				@$(".modal-footer").prepend html
			return @
		renderModal:()->
			render = Marionette.Renderer.render
			if @templateFooter then @$(".modal-footer").prepend render(@templateFooter)
			if @options.title then @$(".modal-title").html(@options.title)
		constructor:(options)->
			super(options)
			@on "render",=> @renderModal()
			@$el.appendTo($("body"))
			@render()

	class UserEditor extends BM.ItemView
		template:_.template """ 
			<div class="form-group">
				<label for="">JSON Data</label>
				<textarea class="form-control" name="json" rows="10"></textarea>
			</div>
			<p>
      	        <button type="button" class="btn btn-danger btn-destroy">
					<i class="glyphicon glyphicon-trash"></i> Destroy
      	        </button>
      	        <span class="pull-right"><button type="button" class="btn btn-primary btn-save">Save</button>
      	        	<button type="button" class="btn btn-default" data-dismiss="modal">Close</button></span>
      	    </p>
		"""
		events:
			"click .btn-destroy":()->
				if confirm("Sure to delete this user?")
					@model.destroy()
					@modalView.modal("hide")
				
			"click .btn-save":()->
				try 
					data = $.parseJSON @$("[name=json]").val()
					@model.save data,success:=>
						alert("User Data Saved Successfully.")
						@modalView.modal("hide")
				catch e then console.log "save err",e
		onRender:()->
			json = JSON.stringify @model.toJSON(),null,4
			@$("[name=json]").val(json) if @model

	class QuickView extends BM.CompositeView
		constructor:(options,b,c,d)->
			attrs = ["itemView","itemViewContainer","template","tagName","className"]
			_.extend this,_.pick(options,attrs)
			super(options,b,c,d)
	class Users extends Backbone.Collection
		url:"/user/api/"
		model:Backbone.Model.extend
			idAttribute:"_id"
			defaults:
				role:"guest"
	class UserTableView extends BM.CompositeView
		template:"#tmpl-users"
		itemViewContainer:"#users-tbody"
	class AdminController extends BM.Controller
		getModalView:->
			unless @modalView 
				@modalView = new ModalView
			return @modalView
		editUser: (user)->
			modal = @getModalView()
			editor = (new UserEditor(model:user)).render()
			modal.show(editor).modal('show')
		initialize:(options)->
			ctrl = this
			users = new Users()
			tableView = new QuickView
				# class attrs
				template:"#tmpl-users"
				itemView:BM.ItemView.extend
					template:"#tmpl-user-tr"
					tagName:"tr"
					events:
						"click .btn-edit":(e)->
							e.preventDefault()
							ctrl.editUser(@model)
				itemViewContainer:"#users-tbody"
				# implement attrs
				el:"#users"
				collection:users
			tableView.render()
			users.fetch success:->
				tableView.render()

	window.app = app = new BM.Application()
	$ -> app.ctrl = new AdminController()