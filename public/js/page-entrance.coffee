require ["backbone.marionette"],(BM)->
	console.log "backbone.marionette",BM
	$(".nav-tabs a").click -> $(@).tab("show")