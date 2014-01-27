
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
		      <div class="modal-footer">
      	        <button type="button" class="btn btn-primary btn-save" data-dismiss="modal">Save</button>
      	        <button type="button" class="btn pull-left btn-danger btn-destroy" data-dismiss="modal">
					<i class="glyphicon glyphicon-trash"></i> Destroy
      	        </button>
      	        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
		      </div>
		    </div><!-- /.modal-content -->
		  </div><!-- /.modal-dialog -->
		"""
		modal:(a,b,c)-> 
			@$el.modal(a,b,c)
			return @
		show:(view)->
			@body.show(view)
			if view.title then @$(".modal-title").html(view.title)
			if view.templateFooter 
				html = Marionette.Renderer.render(view.templateFooter,data)
				@$(".modal-footer").prepend html
			return @
		renderModal:()->
			# _.extend this,_.pick(@options,"templateBody","templateFooter","title")
			data = @options?.model
			render = Marionette.Renderer.render
			# if @templateBody then @$(".modal-body").html render(@templateBody,data)
			if @templateFooter then @$(".modal-footer").prepend render(@templateFooter,data)
			if @options.title then @$(".modal-title").html(@options.title)
		constructor:(options)->
			super(options)
			@on "render",=> @renderModal()
			@$el.appendTo($("body"))
			@render()

	class UserEditor extends BM.ItemView
		template:_.template """ 
			<label for="">JSON Data</label>
			<textarea class="form-control" name="json" rows="10"></textarea>
		"""
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
							console.log "edit",@model
							ctrl.editUser(@model)
				# implement attrs
				itemViewContainer:"#users-tbody"
				el:"#users"
				collection:users
			tableView.render()
			users.fetch success:->
				console.log users.toJSON()
				tableView.render()

			# v = new QuickView
			# 	template:_.template """<%=key%>,<%=value%>"""
			# 	model:new Backbone.Model(key:"keykey",value:"vv")
			# v.render()
			# $ -> v.$el.appendTo($("body"))
	window.app = app = new BM.Application()
	$ -> app.ctrl = new AdminController()