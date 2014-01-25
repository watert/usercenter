require.config
	paths:
        "bootstrap3":"libs/bootstrap3/js/bootstrap.min"
        "jquery":"libs/jquery-1.10.2.min"
        "underscore":"libs/underscore-min"
        "backbone":"libs/backbone-min"
        "backbone.marionette":"libs/backbone.marionette.bundle.min"
        "ldata":"libs/jquery.lightDataBind"
	shim:
		"ldata":["jquery"]
		"bootstrap3":
			deps:["loadCss","jquery"]
			init: (loadCss)-> loadCss("libs/bootstrap3/css/bootstrap.min.css")
		"backbone":["underscore"]
		"backbone.marionette": deps:["backbone"], init: -> Backbone.Marionette
define "loadCss",["jquery"],()->
	(url)-> $("<link>",type:"text/css",rel:"stylesheet",href:require.toUrl(url)).appendTo($("head"))