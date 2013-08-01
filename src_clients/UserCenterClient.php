<?php
/**
 * github: https://github.com/watert/usercenter
 * example:
 * $ucc = new UserCenterClient();
 * $user = $ucc->getUser();
 */

class UserCenterClient {
	// var $host = "http://waterwu.me:3003";
	var $baseUrl = "/sso";
	var $checkUrl = "/sso/check";
	function __construct($host="http://waterwu.me:3003"){
		session_start();
		$this->host = $host;
	}
	function currentUrl(){
		return "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
	}
	
	function clearTicket(){
		$currentUrl = $this->currentUrl();
		$url = preg_replace('/(?:&|(\?))' . "ticket" . '=[^&]*(?(1)&|)?/i', "$1", $currentUrl);
		if(substr($url, -1)=="?"){
			$url = substr($url,0,-1);
		}
		header("location: $url");

	}
	function login($callback=false){ // return to callback
		$currentUrl = $this->currentUrl();
		$user = $this->getUser();
		if($user)header("location: $callback");
	}
	// private function loginByTicket()
	function loginedUser(){
		if(isset($_SESSION["user"])&&is_array($_SESSION["user"])){
			if(isset($_GET["ticket"])){ //redirect and remove ticket
				$url = preg_replace('/(?:&|(\?))' . "ticket" . '=[^&]*(?(1)&|)?/i', "$1", $currentUrl);
				if(substr($url, -1)=="?"){
					$url = substr($url,0,-1);
				}
				header("location: $url");
			}
			return $_SESSION["user"];
		}else {
			return false;
		}
	}
	function getUser(){
		$baseUrl = $this->host.$this->baseUrl;
		$checkUrl = $this->host.$this->checkUrl;
		$currentUrl = $this->currentUrl();

		// SESSION
		$user = $this->loginedUser();
		if($user)return $_SESSION["user"];

		// TICKETS
		if(isset($_GET["ticket"])){
			$ticket = $_GET["ticket"];			
		}
		else {
			$ticket = null;
		}
		if($ticket){
			$url = "$checkUrl?ticket=$ticket";
			$user = json_decode(file_get_contents($url),true);
			$_SESSION["user"] = $user;
			UserCenterClient::clearTicket();
			return $user;
		}else {
			$query = http_build_query(array("callback"=>$currentUrl));
			$url = "$baseUrl?$query";
			// exit("$query, $url");

			header("location: $url");
		}
	}
}