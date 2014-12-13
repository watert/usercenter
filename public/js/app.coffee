define ["backbone"],(Backbone)->

	app = _.extend {}, Backbone.Events
	class app.View extends Backbone.View
		initialize:(options)->
			@options = options
			@model = options.model
			@collection = options.collection
		render:()->
			@trigger("render")
			@onRender?()
	return app