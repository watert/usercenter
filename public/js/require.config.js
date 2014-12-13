require.config({
	baseUrl:"js",
	shim:{
		"backbone":["underscore"],
		"jquery-bbq-deparam":["jquery"],
		"bootstrap":["jquery"],
		"momentCn":["moment"],
		"select2Locale":["select2Main"]
	},
	paths:{
		backbone: "../../bower_components"+"/backbone/backbone",
		underscore: "../../bower_components"+"/underscore/underscore",
		jquery: "../../bower_components"+"/jquery/dist/jquery.min",
		"$.deparam": "../../bower_components"+"/jquery-bbq-deparam/jquery-deparam",
		marked: "../../bower_components"+"/marked/lib/marked",
		bootstrap:"../../bower_components"+"/bootstrap/dist/js/bootstrap.min",
		highcharts:"../../bower_components"+"/highcharts/highcharts-all",
		select2Main:"../../bower_components"+"/select2/select2.min",
		select2Locale:"../../bower_components"+"/select2/select2_locale_zh-CN",

		moment:"../../bower_components"+"/moment/min/moment.min",
		momentCn:"../../bower_components"+"/moment/min/locale-zh-cn",
		history:"../../bower_components"+"/history.js/scripts/bundled/html4+html5/jquery.history"
	}
});	
define("select2",["select2Main","select2Locale"],function(){ return Select2; })
