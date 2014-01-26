
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
	class ModalView extends BM.ItemView
		className:"modal fade"
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
      	        <button type="button" class="btn btn-destroy" data-dismiss="modal">destroy</button>
      	        <button type="button" class="btn btn-save" data-dismiss="modal">Save</button>
      	        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
		      </div>
		    </div><!-- /.modal-content -->
		  </div><!-- /.modal-dialog -->
		"""
		modal:(a,b,c)->
			@$el.modal(a,b,c)
		onRender:()->
			invokeTmpl = (tmpl,model)->
				if typeof tmpl is "string" then tmpl = _.template tmpl
			data = @options?.model
			if @options.templateBody 
				@$(".modal-body").html Marionette.Renderer.render(@options.templateBody , data)
			if @options.templateFooter 
				@$(".modal-footer").prepend Marionette.Renderer.render(@options.templateFooter , data)
			if @options.title
				@$(".modal-title").html(@options.title)
			console.log "onrender"
		initialize:()-> 
			@$el.appendTo($("body"))
			console.log "initialize"
			@render()

	modal = new ModalView 
		templateBody:_.template """ 
			<label for="">label</label>
			<input type="text" name="fieldName" class="form-control">
		"""
		templateFooter:_.template """
			<button class="btn btn-primary btn-save">Save</button>
		"""
	modal.modal("show")

	class QuickView extends BM.CompositeView
		constructor:(options,b,c,d)->
			attrs = ["itemView","itemViewContainer","template","tagName","className"]
			_.extend this,_.pick(options,attrs)
			super(options,b,c,d)
	class Users extends Backbone.Collection
		url:"/user/api/"
	class AdminController extends BM.Controller
		initialize:(options)->
			users = new Users()
			tableView = new QuickView
				# class attrs
				template:"#tmpl-users"
				itemView:BM.ItemView.extend
					template:"#tmpl-user-tr"
					tagName:"tr"
				itemViewContainer:"#users-tbody"
				# implement attrs
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

	$ -> ctrl = new AdminController()