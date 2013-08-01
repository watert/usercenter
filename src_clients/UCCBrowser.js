// Based on jQuery
var UserCenterClient = function(config){
	var that = this;
	that.config = config;
	config = $.extend(true,{ //defaults
		badge:true,
		fetch:true,
		loginUrl:"data",
		callback:function(){}
	},config||{});

	fetch(function(user){
		updateBadge();
		config.callback(user);
	});
	if(config.badge)setBadge();

	function updateBadge(){
		var dom = that.badgeDom;
		if(!dom)return false;
		dom.find("a").text("user");
		if(user){
			$("span",dom).text("Welcome, ");
			$("a",dom).text(user.name);
		}else {
			$("span",dom).remove();
			var url = config.loginUrl+"/?login&callback="+location.href;
			$("a",dom).text("Login").attr("href",url);
		}
	}
	function setBadge(){
		var tmpl = '<div id="userBadge" style="background:#000;color:#CCC;'
			+"padding:0 16px;font-size:12px;position:absolute;top:0;right:20px;border-radius:0 0 4px 4px;"
			+'">'
				+' <span> Loading...</span> <a style="color:#CEF;" href="http://waterwu.me:3003/user/profile"></a>'
			+'</div>';
		
		var dom = $("<div>").html(tmpl).children().eq(0);
		dom.appendTo($("body"));
		that.badgeDom = dom;
		
	}
	function fetch(callback){
		$.getJSON(config.loginUrl+"/?get_user",function(user){
			if(user.length)user=user[0];
			that.user = user;
			callback(user);
		});
	}
};