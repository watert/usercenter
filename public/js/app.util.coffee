define ["jquery","backbone"],()->
	Util = _.extend {}, Backbone.Events
	class Util.View extends Backbone.View
		initialize:(options)->
			@options = options
			@model = options.model
			@collection = options.collection
		render:()->
			@trigger("render")
			@onRender?()

	return Util
